import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoiceMutation } from '../features/apiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/authSlice';

const CreateInvoice = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('unpaid'); // Default status
  const [createInvoice, { isLoading, error }] = useCreateInvoiceMutation();
  const navigate = useNavigate();

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

      // Create the invoice using the API
      await createInvoice(invoiceData).unwrap();
      console.log('Invoice created successfully');

      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow overflow-scroll bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            Create Invoice
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.data?.message}</p>}
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;