import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

const initialState = {
  invoices: [], // Stores the list of invoices
  isLoading: false, // Tracks loading state for fetching invoices
  error: null, // Stores any error that occurs during fetching
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action) => {
      state.invoices = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle fulfilled state of getInvoices query
    builder.addMatcher(
      apiSlice.endpoints.getInvoices.matchFulfilled,
      (state, action) => {
        console.log('Get Invoices Payload:', action.payload);
        state.invoices = action.payload || []; // Ensure it defaults to an empty array
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle fulfilled state of createInvoice mutation
    builder.addMatcher(
      apiSlice.endpoints.createInvoice.matchFulfilled,
      (state, action) => {
        console.log('Create Invoice Payload:', action.payload);
        if (action.payload) {
          state.invoices.push(action.payload); // Add the created invoice to the state
        }
      }
    );

    // Handle fulfilled state of updateInvoice mutation
    builder.addMatcher(
      apiSlice.endpoints.updateInvoice.matchFulfilled,
      (state, action) => {
        console.log('Update Invoice Payload:', action.payload);
        const updatedInvoice = action.payload; // The updated invoice object
        const index = state.invoices.findIndex((invoice) => invoice._id === updatedInvoice._id);
        if (index !== -1) {
          state.invoices[index] = updatedInvoice; // Replace the old invoice with the updated one
        }
      }
    );

    // Handle fulfilled state of deleteInvoice mutation
    builder.addMatcher(
      apiSlice.endpoints.deleteInvoice.matchFulfilled,
      (state, action) => {
        console.log('Delete Invoice Meta Arg:', action.meta.arg);
        const deletedId = action.meta.arg; // The ID of the deleted invoice
        state.invoices = state.invoices.filter((invoice) => invoice._id !== deletedId);
      }
    );
  },
});

export const { setInvoices, setLoading, setError } = invoiceSlice.actions;

export default invoiceSlice.reducer;

export const selectInvoices = (state) => state.invoices.invoices;
export const selectIsLoading = (state) => state.invoices.isLoading;
export const selectError = (state) => state.invoices.error;