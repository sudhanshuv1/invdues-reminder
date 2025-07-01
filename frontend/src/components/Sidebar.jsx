import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  useCheckZapierSubscriptionQuery,
  useTriggerRemindersMutation,
  useSubscribeZapierMutation,
  useUnsubscribeZapierMutation 
} from '../features/apiSlice';

const Sidebar = () => {
  const location = useLocation();
  const [triggerReminders, { isLoading: triggering }] = useTriggerRemindersMutation();
  const [subscribeZapierMutation, { isLoading: subscribing }] = useSubscribeZapierMutation();
  const [unsubscribeZapierMutation, { isLoading: unsubscribing }] = useUnsubscribeZapierMutation();
  
  const { data: subscriptionData, refetch: refetchSubscription } = useCheckZapierSubscriptionQuery();
  const isSubscribed = subscriptionData?.sendReminders || false;

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.includes(path) && path !== '/dashboard';
  };

  // Base classes for navigation items
  const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200";
  const activeClasses = "bg-blue-600 dark:bg-blue-700 text-white shadow-lg";
  const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100";

  const handleTriggerReminders = async () => {
    const zapierOAuthToken = localStorage.getItem('zapierOAuthToken');
    if (!zapierOAuthToken) {
      const currentRedirectUri = window.location.origin + '/dashboard';
      window.location.href = `/dashboard/oauth-consent?redirect_uri=${encodeURIComponent(currentRedirectUri)}&state=triggerReminder`;
      return;
    }
    
    try {
      await triggerReminders({}).unwrap();
      alert("Reminder emails triggered successfully.");
    } catch (error) {
      console.error("Error triggering reminders:", error);
      alert("Failed to trigger reminders. Please try again.");
    }
  };

  const handleSubscriptionToggle = async () => {
    if (isSubscribed) {
      try {
        await unsubscribeZapierMutation({}).unwrap();
        alert("Unsubscribed from Zapier successfully.");
        refetchSubscription();
      } catch (error) {
        console.error("Error unsubscribing:", error);
        alert("Failed to unsubscribe from Zapier.");
      }
    } else {
      try {
        await subscribeZapierMutation({}).unwrap();
        alert("Subscribed to Zapier successfully.");
        refetchSubscription();
      } catch (error) {
        console.error("Error subscribing:", error);
        alert("Failed to subscribe to Zapier.");
      }
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-full border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Navigation</h2>
        <nav className="space-y-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`${baseClasses} ${
              isActive('/dashboard') ? activeClasses : inactiveClasses
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            Dashboard
          </Link>

          {/* Create Invoice */}
          <Link
            to="/dashboard/new-invoice"
            className={`${baseClasses} ${
              isActive('/dashboard/new-invoice') || isActive('/dashboard/edit-invoice') ? activeClasses : inactiveClasses
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Link>

          {/* Email Settings */}
          <Link
            to="/dashboard/mail-settings"
            className={`${baseClasses} ${
              isActive('/dashboard/mail-settings') ? activeClasses : inactiveClasses
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Settings
          </Link>

          {/* Reminder Control */}
          <Link
            to="/dashboard/reminder-control"
            className={`${baseClasses} ${
              isActive('/dashboard/reminder-control') ? activeClasses : inactiveClasses
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reminder Control
          </Link>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-600 my-4"></div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Trigger Reminder Emails */}
            <button
              onClick={handleTriggerReminders}
              disabled={triggering}
              className={`${baseClasses} cursor-pointer w-full text-left ${
                triggering 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {triggering ? "Triggering..." : "Trigger Reminder Emails"}
            </button>

            {/* Subscribe to Zapier */}
            <button
              onClick={handleSubscriptionToggle}
              disabled={subscribing || unsubscribing}
              className={`${baseClasses} cursor-pointer w-full text-left ${
                subscribing || unsubscribing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : isSubscribed
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {subscribing || unsubscribing
                ? "Processing..."
                : isSubscribed
                ? "Unsubscribe from Zapier"
                : "Subscribe to Zapier"}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;