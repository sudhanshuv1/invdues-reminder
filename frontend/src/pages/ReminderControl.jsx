import React, { useState } from 'react';
import { 
  useGetReminderStatusQuery,
  useStartRemindersMutation,
  useStopRemindersMutation,
  useSendImmediateRemindersMutation,
  useGetMailConfigQuery
} from '../features/apiSlice';
import DashboardLayout from '../components/DashboardLayout';

const ReminderControl = () => {
  const { data: reminderStatus, isLoading: reminderLoading, refetch } = useGetReminderStatusQuery();
  const { data: mailConfig, isLoading: mailLoading } = useGetMailConfigQuery();
  
  const [startReminders] = useStartRemindersMutation();
  const [stopReminders] = useStopRemindersMutation();
  const [sendImmediateReminders] = useSendImmediateRemindersMutation();

  // Add this state to track processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Properly extract email configuration status
  const isEmailConfigured = mailConfig?.configured || false;
  
  // Properly extract reminder status
  const isReminderActive = reminderStatus?.isActive || false;

  const lastReminderSent = reminderStatus?.lastReminderSent
    ? new Date(reminderStatus.lastReminderSent).toLocaleString()
    : 'Never';

  const handleStart = async () => {
    if (!isEmailConfigured) {
      alert('Please configure your email settings first before starting reminders.');
      return;
    }

    setIsProcessing(true);
    try {
      await startReminders().unwrap();
      alert('Reminders started successfully!');
      refetch();
    } catch (error) {
      alert('Failed to start reminders: ' + (error.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    setIsProcessing(true);
    try {
      await stopReminders().unwrap();
      alert('Reminders stopped successfully!');
      refetch();
    } catch (error) {
      alert('Failed to stop reminders: ' + (error.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendImmediate = async () => {
    if (!isEmailConfigured) {
      alert('Please configure your email settings first before sending reminders.');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendImmediateReminders().unwrap();
      alert(`${result.count || 0} reminder emails sent successfully!`);
    } catch (error) {
      alert('Failed to send reminders: ' + (error.data?.message || error.message));
    } finally {
      setIsSending(false);
      refetch();
    }
  };

  // Show loading state while fetching data
  if (reminderLoading || mailLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">Loading reminder status...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">Reminder Control</h1>
          <p className="dark:text-gray-300 text-gray-600 mt-1">Manage your automated reminder system</p>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {!isEmailConfigured && (
              <div className="bg-yellow-50 dark:bg-gray-800 dark:border-gray-600 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Email not configured. Please set up your email settings first.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold">Reminder System Status</h3>
                  <p className="text-sm dark:text-gray-200 text-gray-600">
                    Status: <span className={`font-medium ${isReminderActive ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}>
                      {isReminderActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p className="text-sm dark:text-gray-200 text-gray-600">
                    Email: <span className={`font-medium ${isEmailConfigured ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}>
                      {isEmailConfigured ? 'Configured' : 'Not Configured'}
                    </span>
                  </p>
                  {lastReminderSent && (
                    <p className="text-sm dark:text-gray-200 text-gray-500">
                      Last reminder emails were sent on: <span className="font-medium dark:text-green-400 text-green-600">{lastReminderSent}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {!isReminderActive ? (
                    <button
                      onClick={handleStart}
                      disabled={isProcessing || !isEmailConfigured}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
                    >
                      {isProcessing ? 'Starting...' : 'Start Reminders'}
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      disabled={isProcessing}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
                    >
                      {isProcessing ? 'Stopping...' : 'Stop Reminders'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 dark:text-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Send Immediate Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200 mb-3">
                  Send reminder emails to all clients with overdue invoices right now.
                </p>
                <button
                  onClick={handleSendImmediate}
                  disabled={isSending || (isProcessing && !isReminderActive) || !isEmailConfigured}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
                >
                  {isSending || (isProcessing && !isReminderActive) ? 'Sending...' : 'Send Now'}
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-200 dark:border-gray-600 dark:border p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p><strong>How it works:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>When you start reminders, immediate emails are sent to all overdue invoice recipients</li>
                  <li>The system then sends periodic reminders daily at 9 AM</li>
                  <li>Only invoices with status 'unpaid' or 'overdue' and past due dates are included</li>
                  <li>You can stop the system anytime to pause periodic reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReminderControl;