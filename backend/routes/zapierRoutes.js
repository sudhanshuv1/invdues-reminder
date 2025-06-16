// routes/zapierRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeZapier, unsubscribeZapier } = require('../controllers/zapierController');
const verifyJWT = require('../middleware/verifyJWT');
const { checkZapierSubscription } = require('../controllers/zapierController');
router.use(verifyJWT); // Protect all routes below this

// POST /api/zapier/subscribe
router.post('/subscribe', subscribeZapier);

router.get('/check-subscription', checkZapierSubscription);


// DELETE /api/zapier/unsubscribe
router.post('/unsubscribe', unsubscribeZapier);

module.exports = router;
