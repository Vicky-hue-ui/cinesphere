import axios from 'axios';

const tmdbAPI = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

// Always attach the latest API key dynamically from import.meta.env
tmdbAPI.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  config.params = {
    ...config.params,
    api_key: apiKey,
  };
  return config;
});


// Fetch trending movies (global — includes Hindi/Bollywood)
export const getTrending = () => tmdbAPI.get('/trending/movie/week');

// Search movies by query (searches all languages)
export const searchMovies = (query) =>
  tmdbAPI.get('/search/movie', { params: { query } });

// Search movies specifically in Hindi
export const searchHindiMovies = (query) =>
  tmdbAPI.get('/search/movie', {
    params: { query, language: 'hi', region: 'IN' },
  });

// Get movie details by ID
export const getMovieDetails = (id) => tmdbAPI.get(`/movie/${id}`);

// Get movie videos (trailers, teasers, clips)
// Requests BOTH English and Hindi trailers so Bollywood movies get their actual trailers
export const getMovieVideos = (id) =>
  tmdbAPI.get(`/movie/${id}/videos`, {
    params: {
      include_video_language: 'en,hi,null',
    },
  });

// Get movie credits (cast & crew)
export const getMovieCredits = (id) => tmdbAPI.get(`/movie/${id}/credits`);

// Get similar movies
export const getSimilarMovies = (id) => tmdbAPI.get(`/movie/${id}/similar`);

// Get movies by genre (all languages)
export const getMoviesByGenre = (genreId) =>
  tmdbAPI.get('/discover/movie', { params: { with_genres: genreId, sort_by: 'popularity.desc' } });

// Get Hindi / Bollywood movies by genre using TMDB discover
export const getHindiMoviesByGenre = (genreId) =>
  tmdbAPI.get('/discover/movie', {
    params: {
      with_genres: genreId || undefined,
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      region: 'IN',
    },
  });

// Get trending Hindi / Bollywood movies this week
export const getTrendingHindi = () =>
  tmdbAPI.get('/discover/movie', {
    params: {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      region: 'IN',
    },
  });

// Get list of all genres
export const getGenres = () => tmdbAPI.get('/genre/movie/list');

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default tmdbAPI;

