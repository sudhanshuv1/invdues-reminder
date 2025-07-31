import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectIsAuthenticated } from '../features/authSlice';
import { useGetCurrentSubscriptionQuery, useActivateFreePlanMutation } from '../features/apiSlice';
import SubscriptionManager from '../components/SubscriptionManager';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const { data: currentSubscription, refetch: refetchSubscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !isAuthenticated
  });
  const [activateFreePlan, { isLoading: isActivatingFree }] = useActivateFreePlanMutation();

  const handlePlanSelect = async (planName) => {
    if (!isAuthenticated) {
      // Redirect to sign in
      navigate('/signin');
      return;
    }
    
    if (planName.toLowerCase() === 'free') {
      try {
        console.log('Attempting to activate free plan...');
        const result = await activateFreePlan().unwrap();
        console.log('Free plan activation result:', result);
        
        // Refetch subscription data to update the UI
        await refetchSubscription();
        
        toast.success('Successfully switched to Free plan!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error activating free plan:', error);
        toast.error(`Failed to activate free plan: ${error?.data?.message || error.message}`);
        return; // Don't navigate if there's an error
      }
      return;
    }
    
    setSelectedPlan(planName.toLowerCase());
    setShowSubscriptionModal(true);
  };

  const getButtonText = (plan) => {
    if (!isAuthenticated) {
      return plan.name === 'Free' ? 'Get Started Free' : `Start ${plan.name} Trial`;
    }
    
    if (currentSubscription?.plan === plan.name.toLowerCase() && currentSubscription?.status === 'active') {
      return 'Current Plan';
    }
    
    return plan.buttonText;
  };

  const isCurrentPlan = (plan) => {
    return currentSubscription?.plan === plan.name.toLowerCase() && currentSubscription?.status === 'active';
  };
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started with immediate reminders",
      features: [
        "Send immediate reminders",
        "Manual reminder control",
        "Basic email templates", 
        "Up to 50 invoices/month",
        "Email support"
      ],
      limitations: [
        "No automated scheduling",
        "No advanced analytics",
        "Basic customization"
      ],
      buttonText: "Get Started Free",
      buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
      popular: false
    },
    {
      name: "Pro",
      price: "4",
      period: "month",
      description: "Complete automation for growing businesses",
      features: [
        "Everything in Free",
        "Automated scheduling",
        "Smart reminder intervals",
        "Advanced analytics & insights",
        "Custom email templates",
        "Unlimited invoices",
        "Priority support",
        "Payment tracking"
      ],
      limitations: [],
      buttonText: "Start Pro Trial",
      buttonStyle: "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white",
      popular: true
    },
    {
      name: "Enterprise",
      price: "9",
      period: "month",
      description: "Advanced features for large organizations",
      features: [
        "Everything in Pro",
        "White-label solution",
        "API access",
        "Team collaboration",
        "Advanced integrations",
        "Custom workflows",
        "Dedicated support"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
      popular: false
    }
  ];

  return (
    <div className="flex flex-col flex-grow bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Pricing Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-2">
        <div className="px-4 mx-auto">
          {/* Header Section - Reduced spacing */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Simple Pricing
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start free with immediate reminders, upgrade for automated scheduling and advanced features
            </p>
          </div>

          {/* Pricing Cards - Reduced spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-green-500 dark:border-green-400 shadow-green-200 dark:shadow-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-4">
                  {/* Plan Header - Reduced spacing */}
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1 text-sm">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List - Reduced spacing */}
                  <div className="mb-3">
                    <ul className="space-y-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={`limit-${limitIndex}`} className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-500 dark:text-gray-500 line-through">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button - Reduced padding */}
                  <button
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isCurrentPlan(plan)}
                    className={`w-full px-3 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm ${
                      isCurrentPlan(plan) 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : plan.buttonStyle
                    }`}
                  >
                    {getButtonText(plan)}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Section - Minimal spacing */}
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedPlan && (
        <SubscriptionManager
          plan={selectedPlan}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

export default Pricing;