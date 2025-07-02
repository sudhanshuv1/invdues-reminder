const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/oauth/authorize', reminderController.authorizeUrl);
router.post('/oauth/token', reminderController.handleTokenExchange);

router.get('/me', verifyJWT, reminderController.getMe);

router.get('/auth/google', reminderController.googleOAuthAuthorize);
router.get('/auth/google/callback', reminderController.googleOAuthCallback);

router.post('/webhooks/subscribe', reminderController.subscribeWebhook);
router.delete('/webhooks/unsubscribe', reminderController.unsubscribeWebhook);
router.post('/reminders', verifyJWT, reminderController.sendReminders);

// Reminder control endpoints
router.post('/start', verifyJWT, reminderController.startReminders);
router.post('/stop', verifyJWT, reminderController.stopReminders);
router.get('/status', verifyJWT, reminderController.getReminderStatus);
router.post('/send-immediate', verifyJWT, reminderController.sendImmediateReminders);

module.exports = router;