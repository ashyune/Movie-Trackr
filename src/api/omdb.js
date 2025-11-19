// OMDB API Configuration
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'b9a5cbc4';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Helper to get poster image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path || path === 'N/A') return 'https://via.placeholder.com/500x750?text=No+Image';
  return path; // OMDB returns full URLs
};

const fetchFromOMDB = async (params = {}) => {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.append('apikey', OMDB_API_KEY);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OMDB API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.Response === 'False') {
    throw new Error(data.Error || 'OMDB API Error');
  }
  
  return data;
};

export const omdbAPI = {
  // Search movies
  searchMovies: async (query, page = 1) => {
    try {
      const data = await fetchFromOMDB({ s: query, type: 'movie', page });
      return {
        results: data.Search.map(movie => ({
          id: movie.imdbID,
          title: movie.Title,
          poster_path: movie.Poster,
          release_date: movie.Year,
          vote_average: 0 // OMDB doesn't provide rating in search
        })),
        page: parseInt(page),
        total_pages: Math.ceil(parseInt(data.totalResults || 0) / 10),
        total_results: parseInt(data.totalResults || 0)
      };
    } catch (error) {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  // Get trending movies (simulate with popular search terms)
  getTrending: async (timeWindow = 'week', page = 1) => {
    const queries = ['avengers', 'batman', 'star'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    return omdbAPI.searchMovies(randomQuery, page);
  },

  // Get popular movies
  getPopular: async (page = 1) => {
    return omdbAPI.searchMovies('marvel', page);
  },

  // Get top rated movies
  getTopRated: async (page = 1) => {
    return omdbAPI.searchMovies('godfather', page);
  },

  // Get now playing movies
  getNowPlaying: async (page = 1) => {
    return omdbAPI.searchMovies('2024', page);
  },

  // Get upcoming movies
  getUpcoming: async (page = 1) => {
    return omdbAPI.searchMovies('2025', page);
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    const data = await fetchFromOMDB({ i: movieId, plot: 'full' });
    return {
      id: data.imdbID,
      title: data.Title,
      poster_path: data.Poster,
      backdrop_path: data.Poster,
      release_date: data.Released,
      overview: data.Plot,
      vote_average: parseFloat(data.imdbRating) || 0,
      runtime: parseInt(data.Runtime) || 0,
      genres: data.Genre ? data.Genre.split(', ').map(name => ({ name })) : [],
      production_companies: [],
      tagline: data.Awards || ''
    };
  },

  // Get movie recommendations (not supported by OMDB)
  getRecommendations: async (movieId, page = 1) => {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  },

  // Get genres (not supported by OMDB)
  getGenres: async () => {
    return { genres: [] };
  },

  // Discover movies by genre (not supported by OMDB)
  discoverByGenre: async (genreId, page = 1) => {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
};

export default omdbAPI;