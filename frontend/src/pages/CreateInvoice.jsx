import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from '../features/apiSlice';
import DashboardLayout from '../components/DashboardLayout';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the invoice ID from the pathname if editing
  const isEditing = location.pathname.includes('edit-invoice');
  const invoiceId = isEditing ? location.pathname.split('/').pop() : null;

  // Fetch the invoice data if editing
  const { data: invoice, isLoading: isFetching, error: fetchError, refetch } = useGetInvoiceByIdQuery(invoiceId, {
    skip: !isEditing, // Skip the query if not editing
  });

  // State for form fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('unpaid');

  // RTK Query mutations
  const [createInvoice, { isLoading: isCreating, error: createError }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating, error: updateError }] = useUpdateInvoiceMutation();

  // Populate form fields when editing
  useEffect(() => {
    if (isEditing && invoice) {
      setClientName(invoice.clientName || '');
      setClientEmail(invoice.clientEmail || '');
      setAmount(invoice.amount ? invoice.amount.toString() : '');
      setDueDate(invoice.dueDate ? invoice.dueDate.split('T')[0] : '');
      setStatus(invoice.status || 'unpaid');
    }
  }, [isEditing, invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = {
      clientName,
      clientEmail,
      amount: parseFloat(amount),
      dueDate,
      status,
    };

    try {
      if (isEditing) {
        // Update the existing invoice
        await updateInvoice({ id: invoiceId, updates: invoiceData }).unwrap();
        console.log('Invoice updated successfully');
        // Refetch the updated invoice
        refetch();
      } else {
        // Create a new invoice if not editing
        await createInvoice(invoiceData).unwrap();
        console.log('Invoice created successfully');
      }

      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save invoice:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">
            {isEditing ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="dark:text-gray-300 text-gray-600 mt-1">
            {isEditing ? 'Update invoice details' : 'Fill in the details to create a new invoice'}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-6 max-h-[calc(100vh-12rem)] my-auto">
          <div className="max-w-md m-auto h-[100%]">
            {isFetching ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading invoice details...</div>
              </div>
            ) : fetchError ? (
              <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg mb-6">
                Failed to load invoice: {fetchError.message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-lime-300 shadow-md rounded px-8 pt-6 pb-8">
                {/* Form Fields */}
                <div className="mb-4">
                  <label htmlFor="clientName" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-600 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="clientEmail" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Email"
                    className="shadow appearance-none border rounded dark:bg-gray-600 w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="shadow appearance-none border rounded w-full py-2 px-3 dark:bg-gray-600 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="dueDate" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 dark:bg-gray-600 dark:text-gray-300 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="status" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 dark:bg-gray-600 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isCreating || isUpdating}
                  >
                    {isEditing ? (isUpdating ? 'Updating Invoice...' : 'Update Invoice') : isCreating ? 'Creating Invoice...' : 'Create Invoice'}
                  </button>
                  {(createError || updateError) && (
                    <p className="text-red-500 text-sm mt-2">
                      {createError?.data?.message || updateError?.data?.message}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;