import React, { useEffect, useState } from 'react';
import { useGetInvoicesQuery, useTriggerRemindersMutation } from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Fetch invoices using RTK Query.
  const { data: invoices = [], isLoading, error: fetchError, refetch } = useGetInvoicesQuery();
  
  // Mutation hook for triggering Zapier reminders.
  const [triggerReminders, { isLoading: triggering }] = useTriggerRemindersMutation();
  
  useEffect(() => {
    // Refetch invoices every time the Dashboard is rendered.
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
    // Check if a Zapier OAuth token is stored.
    const zapierOAuthToken = localStorage.getItem('zapierOAuthToken');
    if (!zapierOAuthToken) {
      // If not, redirect to your OAuth consent page.
      // Here, we'll pass the current page's URL as the redirect_uri and a state value.
      const currentRedirectUri = window.location.origin + '/dashboard';
      navigate(
        `oauth-consent?redirect_uri=${encodeURIComponent(currentRedirectUri)}&state=triggerReminder`
      );
      return;
    }
    
    // Optionally, you could filter invoices (for example, by checking due dates)
    // const dueInvoices = invoices.filter(invoice => new Date(invoice.dueDate) < new Date());
    // For simplicity, we'll trigger the action without additional payload.
    try {
      await triggerReminders({}).unwrap();
      alert("Reminder emails triggered successfully.");
    } catch (error) {
      console.error("Error triggering reminders:", error);
      alert("Failed to trigger reminders. Please try again.");
    }
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
