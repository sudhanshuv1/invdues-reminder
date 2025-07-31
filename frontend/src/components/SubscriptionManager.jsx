import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../features/authSlice';
import { 
  useGetCurrentSubscriptionQuery, 
  useCreateSubscriptionOrderMutation,
  useCreateRecurringSubscriptionMutation, 
  useVerifyPaymentMutation,
  useVerifySubscriptionPaymentMutation,
  useCancelSubscriptionMutation 
} from '../features/apiSlice';

const SubscriptionManager = ({ plan, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [paymentType, setPaymentType] = useState('onetime'); // 'onetime' or 'subscription'
  
  const user = useSelector(selectCurrentUser);
  const { data: currentSubscription, refetch } = useGetCurrentSubscriptionQuery();
  const [createOrder] = useCreateSubscriptionOrderMutation();
  const [createSubscription] = useCreateRecurringSubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [verifySubscriptionPayment] = useVerifySubscriptionPaymentMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Get plan info
      const planInfo = planDetails[plan];
      
      // Create order
      const response = await createOrder({
        plan: plan,
        billingPeriod: billingPeriod
      }).unwrap();
      
      console.log('Order created:', response);
      
      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.amount,
        currency: response.currency,
        name: 'InvDues Reminder',
        description: `${planInfo.name} Plan - ${billingPeriod}`,
        order_id: response.orderId,
        handler: async function (paymentResponse) {
          try {
            console.log('Payment successful:', paymentResponse);
            
            // Verify payment
            const verifyResponse = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }).unwrap();
            
            console.log('Payment verified:', verifyResponse);
            
            // Close modal and show success message
            onClose();
            toast.success('Payment successful! Your subscription is now active.');
            
            // Refresh subscription data
            refetch();
            
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error(error?.data?.message || 'Failed to initiate payment');
      setError(error?.data?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Get plan info
      const planInfo = planDetails[plan];
      
      // Create recurring subscription
      const response = await createSubscription({
        plan: plan,
        billingPeriod: billingPeriod
      }).unwrap();
      
      console.log('Subscription created:', response);
      
      // Configure Razorpay options for subscription
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: response.subscriptionId,
        name: 'InvDues Reminder',
        description: `${planInfo.name} Plan - ${billingPeriod} subscription`,
        handler: async function (paymentResponse) {
          try {
            console.log('Subscription payment successful:', paymentResponse);
            
            // Verify subscription payment
            const verifyResponse = await verifySubscriptionPayment({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_subscription_id: paymentResponse.razorpay_subscription_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }).unwrap();
            
            console.log('Subscription payment verified:', verifyResponse);
            
            // Close modal and show success message
            onClose();
            toast.success('Subscription activated successfully! You will be charged automatically.');
            
            // Refresh subscription data
            refetch();
            
          } catch (error) {
            console.error('Subscription payment verification failed:', error);
            toast.error('Subscription payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Subscription initiation failed:', error);
      toast.error(error?.data?.message || 'Failed to initiate subscription');
      setError(error?.data?.message || 'Failed to initiate subscription');
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await cancelSubscription().unwrap();
      refetch();
      toast.success('Subscription cancelled successfully');
      onClose();
    } catch (error) {
      console.error('Cancellation error:', error);
      const errorMessage = error?.data?.message || 'Failed to cancel subscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const planDetails = {
    pro: { 
      name: 'Pro', 
      monthlyPrice: 4, 
      yearlyPrice: 40,
      features: ['Automated scheduling', 'Smart reminders', 'Advanced analytics'] 
    },
    enterprise: { 
      name: 'Enterprise', 
      monthlyPrice: 9, 
      yearlyPrice: 90,
      features: ['Everything in Pro', 'White-label', 'Custom integrations'] 
    }
  };

  const planInfo = planDetails[plan];
  const currentPrice = billingPeriod === 'yearly' ? planInfo?.yearlyPrice : planInfo?.monthlyPrice;
  const savings = billingPeriod === 'yearly' ? (planInfo?.monthlyPrice * 12 - planInfo?.yearlyPrice) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Subscribe to {planInfo?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          {/* Billing Period Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Billing Period
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Yearly
                {savings > 0 && (
                  <span className="block text-xs text-green-400">Save ₹{savings}</span>
                )}
              </button>
            </div>
          </div>

          {/* Payment Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Type
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentType('onetime')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  paymentType === 'onetime'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                One-time Payment
              </button>
              <button
                onClick={() => setPaymentType('subscription')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  paymentType === 'subscription'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Auto-Recurring
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {paymentType === 'onetime' 
                ? 'Pay once for the selected period' 
                : 'Automatically charge every billing period'
              }
            </p>
          </div>

          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ₹{currentPrice}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              per {billingPeriod === 'yearly' ? 'year' : 'month'}
            </div>
            {billingPeriod === 'yearly' && savings > 0 && (
              <div className="text-sm text-green-600 dark:text-green-400">
                Save ₹{savings} compared to monthly billing
              </div>
            )}
          </div>

          <ul className="space-y-2">
            {planInfo?.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {currentSubscription?.plan === plan && currentSubscription?.status === 'active' ? (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          ) : (
            <button
              onClick={paymentType === 'onetime' ? handlePayment : handleSubscribe}
              disabled={loading || isProcessing}
              className={`w-full px-4 py-3 ${
                paymentType === 'onetime' 
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                  : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400'
              } text-white font-medium rounded-lg transition-colors duration-200`}
            >
              {isProcessing ? 'Processing...' : loading ? 'Loading...' : 
                `${paymentType === 'onetime' ? 'Pay Once' : 'Subscribe'} - ₹${currentPrice}/${billingPeriod === 'yearly' ? 'year' : 'month'}`
              }
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Secure payment powered by Razorpay
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
