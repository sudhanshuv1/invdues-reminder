import React, { useEffect, useState } from 'react';
import {
  useGetInvoicesQuery,
  useTriggerRemindersMutation,
  useSubscribeZapierMutation,
  useUnsubscribeZapierMutation,
  useCheckZapierSubscriptionQuery,
} from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Fetch invoices.
  const { data: invoices = [], isLoading, error: fetchError, refetch } = useGetInvoicesQuery();
  
  // Mutation hook for triggering reminders.
  const [triggerReminders, { isLoading: triggering }] = useTriggerRemindersMutation();

  // Mutation hooks for subscribing/unsubscribing.
  const [subscribeZapierMutation, { isLoading: subscribing }] = useSubscribeZapierMutation();
  const [unsubscribeZapierMutation, { isLoading: unsubscribing }] = useUnsubscribeZapierMutation();

  // Query hook to check current subscription status.
  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useCheckZapierSubscriptionQuery();

  // Local state for subscription status.
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Update local state when subscriptionData is loaded.
  useEffect(() => {
    if (subscriptionData) {
      setIsSubscribed(subscriptionData.sendReminders);
    }
  }, [subscriptionData]);

  // Refetch invoices on page load.
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleEdit = (invoice) => {
    console.log('Edit invoice:', invoice);
    navigate(`edit-invoice/${invoice._id}`, { state: { invoice } });
  };

  const handleCreateInvoice = () => {
    navigate('new-invoice');
  };

  const handleTriggerReminders = async () => {
    const zapierOAuthToken = localStorage.getItem('zapierOAuthToken');
    if (!zapierOAuthToken) {
      const currentRedirectUri = window.location.origin + '/dashboard';
      navigate(`oauth-consent?redirect_uri=${encodeURIComponent(currentRedirectUri)}&state=triggerReminder`);
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

  // Toggle subscription status.
  const handleSubscriptionToggle = async () => {
    if (isSubscribed) {
      try {
        const response = await unsubscribeZapierMutation({}).unwrap();
        setIsSubscribed(response.sendReminders);
        alert("Unsubscribed from Zapier successfully.");
      } catch (error) {
        console.error("Error unsubscribing:", error);
        alert("Failed to unsubscribe from Zapier.");
      }
    } else {
      try {
        const response = await subscribeZapierMutation({}).unwrap();
        setIsSubscribed(response.sendReminders);
        alert("Subscribed to Zapier successfully.");
      } catch (error) {
        console.error("Error subscribing:", error);
        alert("Failed to subscribe to Zapier.");
      }
    }
    // Refetch the subscription status if needed.
    refetchSubscription();
  };

  return (
    <div className="flex flex-col bg-gray-200 h-[calc(100vh-7.5rem)] md:h-[calc(100vh-7.5rem)] overflow-y-auto">
      {/* Header Section */}
      <div className="w-full flex justify-between my-4 items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleTriggerReminders}
            className="bg-green-500 hover:cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={triggering}
          >
            {triggering ? "Triggering..." : "Trigger Reminder Emails"}
          </button>
          <button
            onClick={handleSubscriptionToggle}
            className="bg-purple-500 hover:cursor-pointer hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={subscribing || unsubscribing || subscriptionLoading}
          >
            {(subscribing || unsubscribing)
              ? "Processing..."
              : (isSubscribed ? "Unsubscribe from Zapier" : "Subscribe to Zapier")}
          </button>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="bg-blue-500 hover:cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Invoice
        </button>
      </div>

      {/* Invoices Section */}
      <div className="flex-grow overflow-y-auto px-4">
        {isLoading && <p>Loading invoices...</p>}
        {fetchError && <p className="text-center text-red-500">Error loading invoices: {fetchError.message}</p>}
        {invoices.length === 0 && !isLoading && (
          <p className="text-center text-gray-600 text-lg font-semibold mt-10">
            You have no invoices.
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {invoices.map((invoice) => (
            <Invoice key={invoice._id} invoice={invoice} onEdit={handleEdit} refetch={refetch} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
