import express from 'express';
import Reminder from '../models/Reminder.js';
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

// @route   GET /api/reminders
// @desc    Get all user reminders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.userId };

    if (status) {
      query.status = status;
    }

    const reminders = await Reminder.find(query).sort({ reminderDate: 1 });
    res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reminders/:id
// @desc    Get reminder by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate, reminderDate, notificationType, notes } = req.body;

    if (!movieId || !reminderDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch movie details from OMDB if not provided
    let movieData = { title, posterPath, releaseDate };
    if (!title || !releaseDate) {
      const omdbData = await fetchMovieDetails(movieId);
      if (omdbData) {
        movieData = {
          title: omdbData.Title,
          posterPath: omdbData.Poster,
          releaseDate: omdbData.Released
        };
      }
    }

    if (!movieData.title || !movieData.releaseDate) {
      return res.status(400).json({ message: 'Could not fetch movie details' });
    }

    // Check if reminder already exists for this movie
    const existingReminder = await Reminder.findOne({
      userId: req.userId,
      movieId,
      status: 'active'
    });

    if (existingReminder) {
      return res.status(400).json({ message: 'Reminder already exists for this movie' });
    }

    const reminder = new Reminder({
      userId: req.userId,
      movieId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      releaseDate: movieData.releaseDate,
      reminderDate,
      notificationType: notificationType || 'app',
      notes
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { reminderDate, notificationType, notes, status } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminderDate !== undefined) reminder.reminderDate = reminderDate;
    if (notificationType !== undefined) reminder.notificationType = notificationType;
    if (notes !== undefined) reminder.notes = notes;
    if (status !== undefined) reminder.status = status;

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reminders/upcoming
// @desc    Get upcoming reminders (next 7 days)
// @access  Private
router.get('/upcoming/week', auth, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      userId: req.userId,
      status: 'active',
      reminderDate: { $gte: now, $lte: nextWeek }
    }).sort({ reminderDate: 1 });

    res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reminders/search/upcoming-movies
// @desc    Search movies from OMDB
// @access  Private
router.get('/search/upcoming-movies', auth, async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        page,
        type: 'movie'
      }
    });

    if (response.data.Response === 'False') {
      return res.json({
        results: [],
        page: 1,
        totalPages: 0,
        totalResults: 0
      });
    }

    const movies = response.data.Search.map(movie => ({
      id: movie.imdbID,
      title: movie.Title,
      posterPath: movie.Poster,
      releaseDate: movie.Year,
      overview: '',
      voteAverage: 0
    }));

    const totalResults = parseInt(response.data.totalResults);
    const totalPages = Math.ceil(totalResults / 10);

    res.json({
      results: movies,
      page: parseInt(page),
      totalPages,
      totalResults
    });
  } catch (error) {
    console.error('OMDB API error:', error);
    res.status(500).json({ message: 'Failed to fetch movies from OMDB' });
  }
});

// @route   GET /api/reminders/movie/:movieId
// @desc    Get movie details from OMDB
// @access  Private
router.get('/movie/:movieId', auth, async (req, res) => {
  try {
    const movieData = await fetchMovieDetails(req.params.movieId);
    
    if (!movieData) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      id: movieData.imdbID,
      title: movieData.Title,
      posterPath: movieData.Poster,
      releaseDate: movieData.Released,
      overview: movieData.Plot,
      voteAverage: movieData.imdbRating,
      runtime: movieData.Runtime,
      genres: movieData.Genre
    });
  } catch (error) {
    console.error('OMDB API error:', error);
    res.status(500).json({ message: 'Failed to fetch movie details' });
  }
});

export default router;
