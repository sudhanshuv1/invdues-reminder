const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Debug Razorpay configuration
console.log('Razorpay Config:', {
  key_id: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'Missing',
  key_secret: process.env.RAZORPAY_KEY_SECRET ? `${process.env.RAZORPAY_KEY_SECRET.substring(0, 8)}...` : 'Missing',
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET ? 'Set' : 'Missing'
});

// Plan configurations
const planConfigs = {
  free: {
    amount: 0, // Free plan
    currency: 'INR',
    interval: 'monthly',
    period: 1,
    item: {
      name: 'Free Plan',
      description: 'Basic features for getting started',
      amount: 0,
      currency: 'INR'
    }
  },
  pro: {
    amount: 400, // ₹4 in paise (₹4 * 100)
    currency: 'INR',
    interval: 'monthly',
    period: 1,
    item: {
      name: 'Pro Plan',
      description: 'Complete automation for growing businesses',
      amount: 400,
      currency: 'INR'
    }
  },
  enterprise: {
    amount: 900, // ₹9 in paise (₹9 * 100)
    currency: 'INR',
    interval: 'monthly',
    period: 1,
    item: {
      name: 'Enterprise Plan',
      description: 'Advanced features for large organizations',
      amount: 900,
      currency: 'INR'
    }
  }
};

// @desc Get current subscription
// @route GET /api/subscription
// @access Private
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let subscription = await Subscription.findOne({ userId });
    
    // Create free trial subscription if none exists
    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: 'free',
        status: 'active' // Free plan is immediately active
      });
      await subscription.save();
    }
    
    // Check if trial has expired (only for non-free plans)
    if (subscription.plan !== 'free' && subscription.status === 'trial' && new Date() > subscription.trialEnd) {
      subscription.status = 'expired';
      subscription.plan = 'free';
      await subscription.save();
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

// @desc Activate free plan
// @route POST /api/subscription/activate-free
// @access Private
const activateFreePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update or create free subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        plan: 'free',
        status: 'active',
        amount: 0,
        currency: 'INR',
        billingPeriod: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now (basically unlimited for free)
      },
      { upsert: true, new: true }
    );
    
    console.log('Free plan activated for user:', userId);
    
    res.json({ 
      message: 'Free plan activated successfully', 
      subscription 
    });
    
  } catch (error) {
    console.error('Error activating free plan:', error);
    res.status(500).json({ 
      message: 'Error activating free plan', 
      error: error.message 
    });
  }
};

// @desc Create subscription order
// @route POST /api/subscription/create-order
// @access Private
const createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan, billingPeriod = 'monthly' } = req.body;
    
    if (!plan || !planConfigs[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const planConfig = planConfigs[plan];
    
    // Calculate amount based on billing period
    let amount = planConfig.amount;
    if (billingPeriod === 'yearly') {
      amount = planConfig.amount * 10; // 10 months price for yearly (2 months free)
    }
    
    console.log('Creating Razorpay order for:', { userId, plan, billingPeriod, amount });
    
    // Create a short receipt (max 40 chars)
    const shortUserId = userId.substring(userId.length - 8); // Last 8 chars of userId
    const timestamp = Date.now().toString().substring(7); // Last 6 digits of timestamp
    const receipt = `ord_${shortUserId}_${timestamp}`;
    
    console.log('Receipt:', receipt, 'Length:', receipt.length);
    
    // Create a simple payment order instead of subscription for testing
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: userId,
        plan: plan,
        billingPeriod: billingPeriod
      }
    });
    
    console.log('Razorpay order created:', order.id);
    
    res.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      plan: plan,
      billingPeriod: billingPeriod,
      key: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('Error creating subscription order:', error);
    res.status(500).json({ 
      message: 'Error creating subscription', 
      error: error.message 
    });
  }
};

// @desc Create recurring subscription
// @route POST /api/subscription/create-subscription
// @access Private
const createRecurringSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan, billingPeriod = 'monthly' } = req.body;
    
    if (!plan || !planConfigs[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const planConfig = planConfigs[plan];
    
    // Calculate amount based on billing period
    let amount = planConfig.amount;
    let period = 'monthly';
    let interval = 1;
    
    if (billingPeriod === 'yearly') {
      amount = planConfig.amount * 10; // 10 months price for yearly (2 months free)
      period = 'yearly';
      interval = 1;
    }
    
    console.log('Creating Razorpay subscription for:', { userId, plan, billingPeriod, amount });
    
    // For now, let's create a subscription order instead of a recurring subscription
    // This will work with the current Razorpay SDK and we can implement webhooks later
    console.log('Creating subscription order (simplified approach)');
    
    // Create a short receipt (max 40 chars)
    const shortUserId = userId.substring(userId.length - 8);
    const timestamp = Date.now().toString().substring(7);
    const receipt = `sub_${shortUserId}_${timestamp}`;
    
    console.log('Receipt:', receipt, 'Length:', receipt.length);
    
    // Create order for subscription payment
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: userId,
        plan: plan,
        billingPeriod: billingPeriod,
        userEmail: user.email,
        subscriptionType: 'recurring'
      }
    });
    
    console.log('Razorpay subscription order created:', order.id);
    
    // Create database subscription record
    const dbSubscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        plan: plan,
        status: 'created',
        razorpayOrderId: order.id,
        amount: amount,
        currency: 'INR',
        billingPeriod: billingPeriod,
        interval: period
      },
      { upsert: true, new: true }
    );
    
    console.log('Database subscription updated:', dbSubscription._id);
    
    res.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      plan: plan,
      billingPeriod: billingPeriod,
      key: process.env.RAZORPAY_KEY_ID,
      isRecurring: true
    });
    
  } catch (error) {
    console.error('Error creating recurring subscription:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      message: 'Error creating subscription', 
      error: error.message,
      details: error.error || error
    });
  }
};

// @desc Handle payment success
// @route POST /api/subscription/verify-payment
// @access Private
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id,
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });
    
    // Verify signature for order payment
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    
    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const order = await razorpay.orders.fetch(razorpay_order_id);
    
    console.log('Payment verified:', payment.status);
    console.log('Order notes:', order.notes);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }
    
    // Extract plan details from order notes
    const { userId, plan, billingPeriod = 'monthly', subscriptionType } = order.notes;
    
    // Calculate subscription end date
    const currentPeriodEnd = new Date();
    if (billingPeriod === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }
    
    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        plan: plan,
        status: 'active',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        billingPeriod: billingPeriod,
        currentPeriodStart: new Date(),
        currentPeriodEnd: currentPeriodEnd,
        isRecurring: subscriptionType === 'recurring'
      },
      { upsert: true, new: true }
    );
    
    console.log('Subscription updated:', subscription._id);
    
    res.json({ 
      message: 'Payment verified successfully', 
      subscription 
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Error verifying payment', 
      error: error.message 
    });
  }
};

// @desc Handle subscription payment success
// @route POST /api/subscription/verify-subscription-payment
// @access Private
const verifySubscriptionPayment = async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature 
    } = req.body;
    
    console.log('Verifying subscription payment:', { razorpay_subscription_id, razorpay_payment_id });
    
    // Verify signature for subscription payment
    const sign = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Subscription payment verification failed' });
    }
    
    // Get subscription details from Razorpay
    const razorpaySubscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    console.log('Subscription payment verified:', payment.status);
    console.log('Subscription status:', razorpaySubscription.status);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Subscription payment not captured' });
    }
    
    // Calculate subscription period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    // Extract billing period from subscription notes
    const billingPeriod = razorpaySubscription.notes?.billingPeriod || 'monthly';
    
    if (billingPeriod === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }
    
    // Update subscription status
    const subscription = await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId: razorpay_subscription_id },
      {
        status: 'active',
        razorpayPaymentId: razorpay_payment_id,
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd
      },
      { new: true }
    );
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    console.log('Subscription activated:', subscription._id);
    
    res.json({ 
      message: 'Subscription payment verified successfully', 
      subscription 
    });
    
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    res.status(500).json({ 
      message: 'Error verifying subscription payment', 
      error: error.message 
    });
  }
};

// @desc Cancel subscription
// @route POST /api/subscription/cancel
// @access Private
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription || !subscription.razorpaySubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    // Cancel in Razorpay
    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, {
      cancel_at_cycle_end: 1 // Cancel at the end of current billing cycle
    });
    
    // Update local subscription
    subscription.status = 'cancelled';
    await subscription.save();
    
    res.json({ 
      message: 'Subscription cancelled successfully. Access will continue until the end of current billing period.' 
    });
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ 
      message: 'Error cancelling subscription', 
      error: error.message 
    });
  }
};

// @desc Handle Razorpay webhooks
// @route POST /api/subscription/webhook
// @access Public (webhook)
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
    
    const event = req.body.event;
    const payload = req.body.payload;
    
    switch (event) {
      case 'subscription.activated':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: payload.subscription.entity.id },
          { status: 'active' }
        );
        break;
        
      case 'subscription.cancelled':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: payload.subscription.entity.id },
          { status: 'cancelled' }
        );
        break;
        
      case 'subscription.completed':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: payload.subscription.entity.id },
          { status: 'expired' }
        );
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  getCurrentSubscription,
  activateFreePlan,
  createSubscriptionOrder,
  createRecurringSubscription,
  verifyPayment,
  verifySubscriptionPayment,
  cancelSubscription,
  handleWebhook
};
