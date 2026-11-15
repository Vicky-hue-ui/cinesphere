const Watchlist = require('../models/Watchlist');

// @desc    Get all watchlists for logged-in user
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user.id });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  const { movieId, movieTitle, poster, releaseDate, rating } = req.body;

  try {
    const alreadyAdded = await Watchlist.findOne({
      user: req.user.id,
      movieId,
    });

    if (alreadyAdded) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    const item = await Watchlist.create({
      user: req.user.id,
      movieId,
      movieTitle,
      poster,
      releaseDate,
      rating,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      user: req.user.id,
      movieId: req.params.movieId,
    });

    if (!item) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };

