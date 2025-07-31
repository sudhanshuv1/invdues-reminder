const express = require('express');
const router = express.Router();
const {
  getCurrentSubscription,
  activateFreePlan,
  createSubscriptionOrder,
  createRecurringSubscription,
  verifyPayment,
  verifySubscriptionPayment,
  cancelSubscription,
  handleWebhook
} = require('../controllers/subscriptionController');
const verifyJWT = require('../middleware/verifyJWT');

// Protected routes
router.use(verifyJWT);

// Get current subscription
router.get('/', getCurrentSubscription);

// Activate free plan
router.post('/activate-free', activateFreePlan);

// Create one-time payment order
router.post('/create-order', createSubscriptionOrder);

// Create recurring subscription
router.post('/create-subscription', createRecurringSubscription);

// Verify one-time payment
router.post('/verify-payment', verifyPayment);

// Verify subscription payment
router.post('/verify-subscription-payment', verifySubscriptionPayment);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Webhook endpoint (should be public)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
