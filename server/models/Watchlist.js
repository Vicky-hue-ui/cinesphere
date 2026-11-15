const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);

