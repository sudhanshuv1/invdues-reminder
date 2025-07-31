const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'], 
    default: 'free' 
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'expired', 'trial'], 
    default: 'trial' 
  },
  // Razorpay integration fields
  razorpaySubscriptionId: String,
  razorpayCustomerId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpayPlanId: String,
  currentPeriodStart: { 
    type: Date, 
    default: Date.now 
  },
  currentPeriodEnd: { 
    type: Date, 
    default: function() {
      // Free trial for 14 days
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  trialEnd: { 
    type: Date, 
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  amount: { 
    type: Number, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  interval: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    default: 'monthly' 
  },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
