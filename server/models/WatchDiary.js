const mongoose = require('mongoose');

const watchDiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movieId: {
      type: String,
      required: [true, 'Movie ID is required'],
    },
    movieTitle: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    poster: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: String,
      default: '',
    },
    watchDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    watchedWhere: {
      type: String,
      trim: true,
      default: 'Home / Streaming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WatchDiary', watchDiarySchema);

