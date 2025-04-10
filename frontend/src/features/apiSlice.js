import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api', // The key for the reducer in the store
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000', // Base URL for all routes
    credentials: 'include', // Include cookies for refresh token and session handling
    prepareHeaders: (headers, { endpoint }) => {
      // Add Authorization header for specific endpoints
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        if (
          endpoint === 'createInvoice' ||
          endpoint === 'getInvoices' ||
          endpoint === 'updateInvoice' ||
          endpoint === 'deleteInvoice' ||
          endpoint === 'logout' ||
          endpoint === 'refresh' ||
          endpoint === 'deleteUser'
        ) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Login with email and password
    loginWithEmail: builder.mutation({
      query: (credentials) => ({
        url: '/auth',
        method: 'POST',
        body: credentials, // { email, password }
      }),
    }),

    // Sign up a new user
    signUp: builder.mutation({
      query: (newUser) => ({
        url: '/user',
        method: 'POST',
        body: newUser, // { displayName, email, password }
      }),
    }),

    // Delete a user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
      }),
    }),

    // Refresh Token
    refresh: builder.query({
      query: () => '/auth/refresh',
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // Create a new invoice
    createInvoice: builder.mutation({
      query: (invoice) => ({
        url: '/invoice',
        method: 'POST',
        body: invoice, // { userId, clientName, clientEmail, amount, dueDate, status }
      }),
    }),

    // Get all invoices for a user
    getInvoices: builder.query({
      query: () => '/invoice',
    }),

    // Update an invoice by ID
    updateInvoice: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/invoice/${id}`,
        method: 'PATCH',
        body: updates, // e.g., { status: 'paid' }
      }),
    }),

    // Delete an invoice by ID
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoice/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginWithEmailMutation,
  useSignUpMutation,
  useDeleteUserMutation,
  useRefreshQuery,
  useLogoutMutation,
  useCreateInvoiceMutation, // Hook for creating an invoice
  useGetInvoicesQuery, // Hook for fetching invoices
  useUpdateInvoiceMutation, // Hook for updating an invoice
  useDeleteInvoiceMutation, // Hook for deleting an invoice
} = apiSlice;