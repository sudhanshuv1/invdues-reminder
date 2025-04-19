import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from '../features/apiSlice';

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
  const [status, setStatus] = useState('unpaid'); // Default status

  const [createInvoice, { isLoading: isCreating, error: createError }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating, error: updateError }] = useUpdateInvoiceMutation();

  // Populate form fields with invoice data when editing
  useEffect(() => {
    if (invoice) {
      setClientName(invoice.clientName);
      setClientEmail(invoice.clientEmail);
      setAmount(invoice.amount);
      setDueDate(invoice.dueDate.split('T')[0]); // Convert ISO date to YYYY-MM-DD
      setStatus(invoice.status);
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        clientName,
        clientEmail,
        amount,
        dueDate,
        status,
      };

      if (isEditing) {
        // Update the invoice if editing
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
    <div className="flex flex-col items-center justify-center flex-grow h-[calc(100vh-9rem)] md:h-[calc(100vh-9.5rem)] overflow-y-auto bg-gray-100 px-4">
      {isFetching ? (<p>Loading invoice details...</p>)
       : 
      fetchError ? (<p className="text-red-500">Failed to load invoice: {fetchError.message}</p>)
      : (
        <>
          <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Invoice' : 'Create Invoice'}</h1>
          <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
          >
            {/* Form Fields */}
            <div className="mb-4">
              <label htmlFor="clientName" className="block text-gray-700 text-sm font-bold mb-2">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="clientEmail" className="block text-gray-700 text-sm font-bold mb-2">
                Client Email
              </label>
              <input
                type="email"
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Client Email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isCreating || isUpdating}
              >
                {isEditing ? 'Update Invoice' : 'Create Invoice'}
              </button>
              {(createError || updateError) && (
                <p className="text-red-500 text-sm mt-2">
                  {createError?.data?.message || updateError?.data?.message}
                </p>
              )}
            </div>
          </form>
        </>
      )  
    
    }
      
    </div>
  );
};

export default CreateInvoice;