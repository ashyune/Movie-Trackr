import express from 'express';
import Discussion from '../models/Discussion.js';
import auth from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

const OMDB_API_KEY = '6bdacf8a';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

// Helper function to fetch movie details from OMDB
const fetchMovieDetails = async (imdbId) => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: { 
        apikey: OMDB_API_KEY,
        i: imdbId
      }
    });
    if (response.data.Response === 'True') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('OMDB API error:', error);
    return null;
  }
};

// @route   GET /api/discussions
// @desc    Get all discussions (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { movieId, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (movieId) query.movieId = movieId;
    if (category) query.category = category;

    const discussions = await Discussion.find(query)
      .populate('author', 'username profile')
      .populate('comments.author', 'username profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Discussion.countDocuments(query);

    res.json({
      discussions,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/discussions/:id
// @desc    Get discussion by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username profile')
      .populate('comments.author', 'username profile');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment view count
    discussion.viewCount += 1;
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions
// @desc    Create a new discussion
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, movieId, movieTitle, moviePoster, category, tags } = req.body;

    if (!title || !content || !movieId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch movie details from OMDB if not provided
    let movieInfo = { movieTitle, moviePoster };
    if (!movieTitle || !moviePoster) {
      const omdbData = await fetchMovieDetails(movieId);
      if (omdbData) {
        movieInfo = {
          movieTitle: omdbData.Title,
          moviePoster: omdbData.Poster
        };
      }
    }

    const discussion = new Discussion({
      title,
      content,
      author: req.userId,
      movieId,
      movieTitle: movieInfo.movieTitle,
      moviePoster: movieInfo.moviePoster,
      category: category || 'general',
      tags: tags || []
    });

    await discussion.save();
    await discussion.populate('author', 'username profile');

    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id
// @desc    Update discussion
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author
    if (discussion.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title !== undefined) discussion.title = title;
    if (content !== undefined) discussion.content = content;
    if (category !== undefined) discussion.category = category;
    if (tags !== undefined) discussion.tags = tags;

    await discussion.save();
    await discussion.populate('author', 'username profile');

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete discussion
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author
    if (discussion.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions/:id/like
// @desc    Like/unlike a discussion
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    } else {
      // Like
      discussion.likes.push(req.userId);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions/:id/comments
// @desc    Add a comment to discussion
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = {
      author: req.userId,
      content
    };

    discussion.comments.push(comment);
    await discussion.save();
    await discussion.populate('comments.author', 'username profile');

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id/comments/:commentId
// @desc    Update a comment
// @access  Private
router.put('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = discussion.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/discussions/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = discussion.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or discussion author
    if (comment.author.toString() !== req.userId && discussion.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.deleteOne();
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions/:id/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:id/comments/:commentId/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = discussion.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(req.userId);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
