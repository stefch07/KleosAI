const express = require('express');
const rateLimit = require('express-rate-limit');
const { fetchReviews, getReviews, getReviewById, generateResponse, markReviewRead, getStats } = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI generation requests, please try again later' },
});

router.get('/stats', apiLimiter, authenticate, getStats);
router.get('/', apiLimiter, authenticate, getReviews);
router.get('/:id', apiLimiter, authenticate, getReviewById);
router.post('/fetch', apiLimiter, authenticate, fetchReviews);
router.post('/:id/generate-response', aiLimiter, authenticate, generateResponse);
router.patch('/:id/read', apiLimiter, authenticate, markReviewRead);

module.exports = router;
