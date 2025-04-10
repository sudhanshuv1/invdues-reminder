import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './features/apiSlice';
import authReducer from './features/authSlice'; // Import the authSlice reducer

export const store = configureStore({
  reducer: {
    // Add the RTK Query API slice reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Add the auth slice reducer
    auth: authReducer,
  },
  // Add the RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Optional: Enable refetching on focus or reconnect
setupListeners(store.dispatch);