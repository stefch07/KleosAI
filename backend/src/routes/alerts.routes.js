const express = require('express');
const rateLimit = require('express-rate-limit');
const { getAlerts, markAlertRead, markAllAlertsRead, getUnreadCount } = require('../controllers/alerts.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.get('/', apiLimiter, authenticate, getAlerts);
router.get('/unread-count', apiLimiter, authenticate, getUnreadCount);
router.patch('/mark-all-read', apiLimiter, authenticate, markAllAlertsRead);
router.patch('/:id/read', apiLimiter, authenticate, markAlertRead);

module.exports = router;
