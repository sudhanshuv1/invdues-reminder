import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './features/apiSlice';
import invoiceReducer from './features/invoiceSlice';
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // Add apiSlice reducer
    invoices: invoiceReducer, // Add invoiceSlice reducer
    auth: authReducer, // Add authSlice reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Add apiSlice middleware
});

export default store;