import React, { useEffect, useState } from 'react';
import {
  useGetInvoicesQuery,
} from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all'); // New state for filter
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  
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

  // Helper function to determine invoice status
  const getInvoiceStatus = (invoice) => {
    if (invoice.status === 'paid') return 'paid';
    if (invoice.status === 'unpaid') return 'unpaid';
    if (invoice.status === 'overdue') return 'overdue';
    
    // Check if unpaid invoice is overdue
    const currentDate = new Date();
    const dueDate = new Date(invoice.dueDate);
    
    if (invoice.status === 'unpaid' && dueDate < currentDate) {
      return 'overdue';
    }
    
    return 'unpaid';
  };

  // Filter invoices based on selected status and search query
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    const statusMatch = statusFilter === 'all' || getInvoiceStatus(invoice) === statusFilter;
    
    // Search filter - search in client name and email
    const searchMatch = searchQuery === '' || 
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Count invoices by status for display (only count those matching search)
  const searchFilteredInvoices = invoices.filter((invoice) => {
    const searchMatch = searchQuery === '' || 
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  const invoiceCounts = {
    all: searchFilteredInvoices.length,
    paid: searchFilteredInvoices.filter(inv => getInvoiceStatus(inv) === 'paid').length,
    unpaid: searchFilteredInvoices.filter(inv => getInvoiceStatus(inv) === 'unpaid').length,
    overdue: searchFilteredInvoices.filter(inv => getInvoiceStatus(inv) === 'overdue').length,
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section with Search */}
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">Dashboard</h1>
              <p className="dark:text-gray-300 text-gray-600 mt-1">Manage your invoices and reminders</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full ml-4">
              <div className="absolute inset-y-0 z-10 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {!isLoading && invoices.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({invoiceCounts.all})
              </button>
              
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Paid ({invoiceCounts.paid})
              </button>
              
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'unpaid'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Unpaid ({invoiceCounts.unpaid})
              </button>
              
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'overdue'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Overdue ({invoiceCounts.overdue})
              </button>
            </div>
          </div>
        )}

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
          
          {/* Show filtered empty state */}
          {invoices.length > 0 && filteredInvoices.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium dark:text-gray-300 text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? (
                  <>No invoices match your search "{searchQuery}"{statusFilter !== 'all' ? ` in ${statusFilter} status` : ''}.</>
                ) : (
                  <>
                    {statusFilter === 'paid' && 'No invoices have been marked as paid yet.'}
                    {statusFilter === 'unpaid' && 'No unpaid invoices at the moment.'}
                    {statusFilter === 'overdue' && 'No overdue invoices found.'}
                  </>
                )}
              </p>
              <div className="space-x-2">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-700 font-medium mr-2"
                  >
                    Clear search
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all invoices
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <Invoice key={invoice._id} invoice={invoice} onEdit={handleEdit} refetch={refetch} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;