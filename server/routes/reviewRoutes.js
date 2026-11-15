const express = require('express');
const router = express.Router();
const {
  getReviewsByMovie,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:movieId', getReviewsByMovie);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

