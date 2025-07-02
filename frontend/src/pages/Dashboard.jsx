import React, { useEffect, useState } from 'react';
import {
  useGetInvoicesQuery,
} from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Fetch invoices.
  const { data: invoices = [], isLoading, error: fetchError, refetch } = useGetInvoicesQuery();

  // Refetch invoices on page load.
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleEdit = (invoice) => {
    console.log('Edit invoice:', invoice);
    navigate(`edit-invoice/${invoice._id}`, { state: { invoice } });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">Dashboard</h1>
          <p className="dark:text-gray-300 text-gray-600 mt-1">Manage your invoices and reminders</p>
        </div>

        {/* Invoices Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading invoices...</div>
            </div>
          )}
          
          {fetchError && (
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading invoices: {fetchError.message}
            </div>
          )}
          
          {invoices.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium dark:text-gray-300 text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first invoice</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <Invoice key={invoice._id} invoice={invoice} onEdit={handleEdit} refetch={refetch} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;