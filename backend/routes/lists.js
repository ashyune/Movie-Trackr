import express from 'express';
import List from '../models/List.js';
import auth from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

const OMDB_API_KEY = process.env.OMDB_API_KEY || 'b9a5cbc4';
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

// @route   GET /api/lists
// @desc    Get all user lists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId });
    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lists/:listName
// @desc    Get specific list (watchlist, watched, favorites)
// @access  Private
router.get('/:listName', auth, async (req, res) => {
  try {
    const { listName } = req.params;

    if (!['watchlist', 'watched', 'favorites'].includes(listName)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    const list = await List.findOne({ userId: req.userId, name: listName });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lists/:listName/movies
// @desc    Add movie to list
// @access  Private
router.post('/:listName/movies', auth, async (req, res) => {
  try {
    const { listName } = req.params;
    const { movieId, title, posterPath, rating, userRating, notes, watchedDate } = req.body;

    if (!['watchlist', 'watched', 'favorites'].includes(listName)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    const list = await List.findOne({ userId: req.userId, name: listName });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if movie already exists in list
    const movieExists = list.movies.some(movie => String(movie.movieId) === String(movieId));
    if (movieExists) {
      return res.status(400).json({ message: 'Movie already in list' });
    }

    // Fetch movie details from OMDB if not provided
    let movieInfo = { title, posterPath, rating };
    if (!title || !posterPath) {
      const omdbData = await fetchMovieDetails(movieId);
      if (omdbData) {
        movieInfo = {
          title: omdbData.Title,
          posterPath: omdbData.Poster,
          rating: parseFloat(omdbData.imdbRating) || 0
        };
      }
    }

    const movieData = {
      movieId,
      title: movieInfo.title,
      posterPath: movieInfo.posterPath,
      rating: movieInfo.rating,
      userRating,
      notes,
      watchedDate: listName === 'watched' ? watchedDate || new Date() : undefined
    };

    list.movies.push(movieData);
    await list.save();

    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lists/:listName/movies/:movieId
// @desc    Remove movie from list
// @access  Private
router.delete('/:listName/movies/:movieId', auth, async (req, res) => {
  try {
    const { listName, movieId } = req.params;

    if (!['watchlist', 'watched', 'favorites'].includes(listName)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    const list = await List.findOne({ userId: req.userId, name: listName });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    list.movies = list.movies.filter(movie => String(movie.movieId) !== String(movieId));
    await list.save();

    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lists/:listName/movies/:movieId
// @desc    Update movie in list
// @access  Private
router.put('/:listName/movies/:movieId', auth, async (req, res) => {
  try {
    const { listName, movieId } = req.params;
    const { userRating, notes, watchedDate } = req.body;

    if (!['watchlist', 'watched', 'favorites'].includes(listName)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    const list = await List.findOne({ userId: req.userId, name: listName });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const movie = list.movies.find(m => String(m.movieId) === String(movieId));
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in list' });
    }

    if (userRating !== undefined) movie.userRating = userRating;
    if (notes !== undefined) movie.notes = notes;
    if (watchedDate !== undefined) movie.watchedDate = watchedDate;

    await list.save();

    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lists/move
// @desc    Move movie between lists
// @access  Private
router.post('/move', auth, async (req, res) => {
  try {
    const { movieId, fromList, toList } = req.body;

    if (!['watchlist', 'watched', 'favorites'].includes(fromList) ||
        !['watchlist', 'watched', 'favorites'].includes(toList)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    const sourceList = await List.findOne({ userId: req.userId, name: fromList });
    const targetList = await List.findOne({ userId: req.userId, name: toList });

    if (!sourceList || !targetList) {
      return res.status(404).json({ message: 'List not found' });
    }

    const movie = sourceList.movies.find(m => String(m.movieId) === String(movieId));
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in source list' });
    }

    // Check if movie already exists in target list
    const movieExists = targetList.movies.some(m => String(m.movieId) === String(movieId));
    if (movieExists) {
      return res.status(400).json({ message: 'Movie already in target list' });
    }

    // Remove from source list
    sourceList.movies = sourceList.movies.filter(m => String(m.movieId) !== String(movieId));

    // Add to target list
    if (toList === 'watched' && !movie.watchedDate) {
      movie.watchedDate = new Date();
    }
    targetList.movies.push(movie);

    await sourceList.save();
    await targetList.save();

    res.json({ sourceList, targetList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
