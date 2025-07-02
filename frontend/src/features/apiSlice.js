import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout as logoutAction } from './authSlice';

// Standard baseQuery with Authorization header logic
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}`,
  credentials: 'include',
  prepareHeaders: (headers, { endpoint }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      if (
        endpoint === 'createInvoice' ||
        endpoint === 'getInvoices' ||
        endpoint === 'getInvoiceById' ||
        endpoint === 'updateInvoice' ||
        endpoint === 'deleteInvoice' ||
        endpoint === 'logout' ||
        endpoint === 'refresh' ||
        endpoint === 'deleteUser' ||
        endpoint === 'oauthLoginCallback' ||
        endpoint === 'subscribeZapier' ||
        endpoint === 'unsubscribeZapier' ||
        endpoint === 'checkZapierSubscription' ||
        endpoint === 'getMailConfig' ||
        endpoint === 'configureGmail' ||
        endpoint === 'configureSMTP' ||
        endpoint === 'removeMailConfig' ||
        endpoint === 'triggerReminders' ||
        endpoint === 'startReminders' ||
        endpoint === 'stopReminders' ||
        endpoint === 'getReminderStatus' ||
        endpoint === 'sendImmediateReminders'
      ) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }
    return headers;
  },
});

// Enhanced baseQuery that tries /auth/refresh on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );
    if (refreshResult.data?.accessToken) {
      // Store new access token
      localStorage.setItem('accessToken', refreshResult.data.accessToken);
      api.dispatch(setCredentials({
        user: JSON.parse(localStorage.getItem('user')), // or fetch user if needed
        accessToken: refreshResult.data.accessToken,
      }));
      // Retry the original query with new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Optionally, handle logout here
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      api.dispatch(logoutAction());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Login with email and password
    loginWithEmail: builder.mutation({
      query: (credentials) => ({
        url: '/auth',
        method: 'POST',
        body: credentials,
      }),
    }),

    loginWithGoogle: builder.mutation({
      query: () => ({
        url: '/auth/google',
        method: 'GET',
      }),
    }),

    // Sign up a new user
    signUp: builder.mutation({
      query: (newUser) => ({
        url: '/user',
        method: 'POST',
        body: newUser,
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
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
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
        body: invoice,
      }),
    }),

    // Get all invoices for a user
    getInvoices: builder.query({
      query: () => ({
        url: `/invoice`,
      }),
    }),

    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoice/${id}`,
        method: 'GET',
      }),
    }),

    // Update an invoice by ID
    updateInvoice: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/invoice/${id}`,
        method: 'PATCH',
        body: updates,
      }),
    }),

    // Delete an invoice by ID
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoice/${id}`,
        method: 'DELETE',
      }),
    }),

    oauthLoginCallback: builder.mutation({
      query: (body) => ({
        url: '/oauth/login/callback?json=true',
        method: 'POST',
        body,
      }),
    }),

    triggerReminders: builder.mutation({
      query: (body) => ({
        url: '/api/trigger-reminders',
        method: 'POST',
        body,
      }),
    }),

    // New: Subscribe to Zapier endpoint (sets user's sendReminders flag to true)
    subscribeZapier: builder.mutation({
      query: (body) => ({
        url: '/zapier/subscribe',
        method: 'POST',
        body,
      }),
    }),

    // New: Unsubscribe from Zapier endpoint (sets user's sendReminders flag to false)
    unsubscribeZapier: builder.mutation({
      query: (body) => ({
        url: '/zapier/unsubscribe',
        method: 'POST',
        body,
      }),
    }),

    checkZapierSubscription: builder.query({
      query: () => ({
        url: '/zapier/check-subscription',
        method: 'GET',
      }),
    }),

    getMailConfig: builder.query({
      query: () => ({
        url: '/mail-config',
        method: 'GET',
      }),
    }),

    configureGmail: builder.mutation({
      query: (body) => ({
        url: '/mail-config/gmail',
        method: 'POST',
        body,
      }),
    }),

    configureSMTP: builder.mutation({
      query: (body) => ({
        url: '/mail-config/smtp',
        method: 'POST',
        body,
      }),
    }),

    removeMailConfig: builder.mutation({
      query: () => ({
        url: '/mail-config',
        method: 'DELETE',
      }),
    }),

    startReminders: builder.mutation({
      query: () => ({
        url: '/reminder/start',
        method: 'POST',
      }),
    }),

    stopReminders: builder.mutation({
      query: () => ({
        url: '/reminder/stop',
        method: 'POST',
      }),
    }),

    getReminderStatus: builder.query({
      query: () => ({
        url: '/reminder/status',
        method: 'GET',
      }),
    }),

    sendImmediateReminders: builder.mutation({
      query: () => ({
        url: '/reminder/send-immediate',
        method: 'POST',
      }),
    }),

  }),
});

export const {
  useLoginWithEmailMutation,
  useLoginWithGoogleMutation,
  useSignUpMutation,
  useDeleteUserMutation,
  useRefreshQuery,
  useLogoutMutation,
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useOauthLoginCallbackMutation,
  useTriggerRemindersMutation,
  useSubscribeZapierMutation,
  useUnsubscribeZapierMutation,
  useCheckZapierSubscriptionQuery,
  useGetMailConfigQuery,
  useConfigureGmailMutation,
  useConfigureSMTPMutation,
  useRemoveMailConfigMutation,
  useStartRemindersMutation,
  useStopRemindersMutation,
  useGetReminderStatusQuery,
  useSendImmediateRemindersMutation,
} = apiSlice;
