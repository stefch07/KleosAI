const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, me, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', apiLimiter, authenticate, me);
router.patch('/me', apiLimiter, authenticate, updateProfile);

module.exports = router;
