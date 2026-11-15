const express = require('express');
const router = express.Router();
const {
  getDiaryEntries,
  addDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getDiaryEntries).post(addDiaryEntry);
router.route('/:id').put(updateDiaryEntry).delete(deleteDiaryEntry);

module.exports = router;

