import React from 'react';
import { useGetInvoicesQuery } from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data: invoices, isLoading, error } = useGetInvoicesQuery();
  const navigate = useNavigate();

  const handleEdit = (invoice) => {
    console.log('Edit invoice:', invoice);
    // Redirect to edit page or open a modal with invoice details
    navigate(`/edit-invoice/${invoice._id}`, { state: { invoice } });
  };

  const handleCreateInvoice = () => {
    navigate('new-invoice');
  };

  return (
    <div className="flex flex-col items-center justify-start flex-grow overflow-scroll p-4 bg-gray-100">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleCreateInvoice}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Invoice
        </button>
      </div>
      {isLoading && <p>Loading invoices...</p>}
      {error && <p className="text-red-500">Error loading invoices: {error.data?.message}</p>}
      {invoices && invoices.length === 0 && (
        <p className="text-gray-600 text-lg font-semibold mt-10">
          You have no invoices.
        </p>
      )}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full">
        {invoices &&
          invoices.map((invoice) => (
            <Invoice key={invoice._id} invoice={invoice} onEdit={handleEdit} />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;