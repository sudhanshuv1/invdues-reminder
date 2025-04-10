import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectInvoices, selectIsLoading, selectError, setInvoices } from '../features/invoiceSlice';
import { useGetInvoicesQuery } from '../features/apiSlice';
import Invoice from '../components/Invoice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get invoices state from Redux
  const invoices = useSelector(selectInvoices);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Fetch invoices using RTK Query
  const { data: fetchedInvoices = [], isFetching, error: fetchError } = useGetInvoicesQuery();

  // Sync fetched invoices with Redux state
  useEffect(() => {
    if (!isFetching && fetchedInvoices.length > 0) {
      dispatch(setInvoices(fetchedInvoices));
    }
  }, [fetchedInvoices, isFetching, dispatch]);

  const handleEdit = (invoice) => {
    console.log('Edit invoice:', invoice);
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
      {fetchError && <p className="text-red-500">Error loading invoices: {fetchError.message}</p>}
      {invoices.length === 0 && !isLoading && (
        <p className="text-gray-600 text-lg font-semibold mt-10">
          You have no invoices.
        </p>
      )}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full">
        {invoices.map((invoice) => (
          <Invoice key={invoice._id} invoice={invoice} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;