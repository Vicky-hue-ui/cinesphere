const express = require('express');
const router = express.Router();
const { cineChat, synthesizeReviews } = require('../controllers/aiController');

router.post('/chat', cineChat);
router.post('/synthesize', synthesizeReviews);

module.exports = router;

