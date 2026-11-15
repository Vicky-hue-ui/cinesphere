const WatchDiary = require('../models/WatchDiary');

// @desc    Get all diary entries for logged-in user
// @route   GET /api/diary
// @access  Private
const getDiaryEntries = async (req, res) => {
  try {
    const entries = await WatchDiary.find({ userId: req.user._id }).sort({ watchDate: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diary entries' });
  }
};

// @desc    Add movie to watch diary
// @route   POST /api/diary
// @access  Private
const addDiaryEntry = async (req, res) => {
  const { movieId, movieTitle, poster, releaseDate, watchDate, rating, reviewNotes, watchedWhere } = req.body;

  if (!movieId || !movieTitle) {
    return res.status(400).json({ message: 'Movie ID and Movie Title are required' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 10) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 10' });
  }

  try {
    const entry = await WatchDiary.create({
      userId: req.user._id,
      movieId: String(movieId),
      movieTitle: String(movieTitle).trim(),
      poster: poster ? String(poster) : '',
      releaseDate: releaseDate ? String(releaseDate) : '',
      watchDate: watchDate ? new Date(watchDate) : new Date(),
      rating: numRating,
      reviewNotes: reviewNotes ? String(reviewNotes).trim() : '',
      watchedWhere: watchedWhere ? String(watchedWhere).trim() : 'Home / Streaming',
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create diary entry' });
  }
};

// @desc    Update a diary entry
// @route   PUT /api/diary/:id
// @access  Private
const updateDiaryEntry = async (req, res) => {
  try {
    const entry = await WatchDiary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    const { rating, reviewNotes, watchDate, watchedWhere } = req.body;
    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 10) {
        entry.rating = numRating;
      }
    }
    if (reviewNotes !== undefined) entry.reviewNotes = String(reviewNotes).trim();
    if (watchDate !== undefined) entry.watchDate = new Date(watchDate);
    if (watchedWhere !== undefined) entry.watchedWhere = String(watchedWhere).trim();

    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update diary entry' });
  }
};

// @desc    Delete a diary entry
// @route   DELETE /api/diary/:id
// @access  Private
const deleteDiaryEntry = async (req, res) => {
  try {
    const entry = await WatchDiary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }
    res.json({ message: 'Diary entry removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete diary entry' });
  }
};

module.exports = {
  getDiaryEntries,
  addDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
};

