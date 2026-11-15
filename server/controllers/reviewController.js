const Review = require('../models/Review');

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/:movieId
// @access  Public
const getReviewsByMovie = async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { movieId, movieTitle, rating, comment } = req.body;

  try {
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      movieId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Movie already reviewed' });
    }

    const review = await Review.create({
      user: req.user.id,
      movieId,
      movieTitle,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviewsByMovie, createReview, updateReview, deleteReview };

