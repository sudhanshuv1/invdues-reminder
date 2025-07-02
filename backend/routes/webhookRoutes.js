const express = require('express');
const { processSubscription } = require('../controllers/webhookController');

const router = express.Router();

// Route to handle subscription webhook requests
router.post('/send-reminder', sendReminder);

module.exports = router;
