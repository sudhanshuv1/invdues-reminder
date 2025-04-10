import React from 'react';
import { useDeleteInvoiceMutation } from '../features/apiSlice';

const Invoice = ({ invoice, onEdit }) => {
  const [deleteInvoice, { isLoading }] = useDeleteInvoiceMutation();

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice._id).unwrap();
      console.log('Invoice deleted successfully');
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 w-full max-w-md md:max-w-lg flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex flex-col mb-4 md:mb-0">
        <h2 className="text-xl font-bold text-gray-800">{invoice.clientName}</h2>
        <p className="text-gray-600">Email: {invoice.clientEmail}</p>
        <p className="text-gray-600">Amount: ${invoice.amount}</p>
        <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p className={`text-sm font-bold ${invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
          Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => onEdit(invoice)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isLoading}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Invoice;