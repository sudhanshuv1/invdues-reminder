import React from 'react';
import { useDeleteInvoiceMutation } from '../features/apiSlice';

const Invoice = ({ invoice, onEdit, refetch }) => {
  const [deleteInvoice, { isLoading }] = useDeleteInvoiceMutation();

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice._id).unwrap();
      console.log('Invoice deleted successfully');
      refetch();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl rounded-lg p-2 mb-4 w-full max-w-md md:max-w-lg">
      <div className="flex flex-col md:flex-row mb-4 md:mb-0 mx-auto justify-between items-center">
        <h2 className="text-xl font-bold dark:text-gray-200 text-gray-800">{invoice.clientName}</h2>
        <div className="flex text-md space-x-4">
          <button
            onClick={() => onEdit(invoice)}
            className="bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white hover:cursor-pointer font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center mb-4 md:mb-0">
        <p className="dark:text-gray-300 text-gray-600"><span className="font-semibold">Email: </span>{invoice.clientEmail}</p>
        <p className="dark:text-gray-300 text-gray-600"><span className="font-semibold">Amount: </span>₹{invoice.amount}</p>
        <p className="dark:text-gray-300 text-gray-600"><span className="font-semibold">Due Date: </span>{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</p>
        <p className={`text-sm font-bold ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'unpaid' ? 'text-red-600' : 'text-violet-900'}`}>
          Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </p>
      </div>
    </div>
  );
};

export default Invoice;