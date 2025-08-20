import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout as logoutAction } from './authSlice';

// Standard baseQuery with Authorization header logic
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}`,
  credentials: 'include',
  prepareHeaders: (headers, { endpoint, getState }) => {
    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // For Google OAuth users, tokens are in HTTP-only cookies, so no Authorization header needed
    // The cookies will be sent automatically with credentials: 'include'
    if (user.googleId || (accessToken === 'cookie-based')) {
      // Don't set Authorization header for Google OAuth users - use cookies instead
      return headers;
    }
    
    // For email/password authentication, use Authorization header with localStorage token
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
        endpoint === 'sendImmediateReminders' ||
        endpoint === 'getEmailTemplate' ||
        endpoint === 'updateEmailTemplate' ||
        endpoint === 'getUserProfile' ||
        endpoint === 'updateUserProfile' ||
        endpoint === 'changePassword' ||
        endpoint === 'deleteUserAccount' ||
        endpoint === 'getUserStats' ||
        endpoint === 'getCurrentSubscription' ||
        endpoint === 'activateFreePlan' ||
        endpoint === 'createSubscriptionOrder' ||
        endpoint === 'createRecurringSubscription' ||
        endpoint === 'verifyPayment' ||
        endpoint === 'verifySubscriptionPayment' ||
        endpoint === 'cancelSubscription'
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // For Google OAuth users, tokens are managed via cookies
      // For email/password users, store in localStorage
      if (!user.googleId && localStorage.getItem('accessToken') !== 'cookie-based') {
        localStorage.setItem('accessToken', refreshResult.data.accessToken);
      }
      
      api.dispatch(setCredentials({
        user: user,
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
  tagTypes: ['EmailTemplate'],
  endpoints: (builder) => ({
    // Login with email and password
    loginWithEmail: builder.mutation({
      query: (credentials) => ({
        url: '/auth',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Exchange Google OAuth code for tokens
    exchangeGoogleCode: builder.mutation({
      query: (code) => ({
        url: '/auth/google/exchange',
        method: 'POST',
        body: { code },
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

    getEmailTemplate: builder.query({
      query: () => ({
        url: '/mail-config/template',
        method: 'GET',
      }),
      providesTags: ['EmailTemplate'],
    }),

    updateEmailTemplate: builder.mutation({
      query: (body) => ({
        url: '/mail-config/template',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // Profile management endpoints
    getUserProfile: builder.query({
      query: () => ({
        url: '/user/profile',
        method: 'GET',
      }),
    }),

    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/user/profile',
        method: 'PATCH',
        body: profileData,
      }),
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/user/change-password',
        method: 'PATCH',
        body: passwordData,
      }),
    }),

    deleteUserAccount: builder.mutation({
      query: () => ({
        url: '/user/account',
        method: 'DELETE',
      }),
    }),

    getUserStats: builder.query({
      query: () => ({
        url: '/user/stats',
        method: 'GET',
      }),
    }),

    // Subscription endpoints
    getCurrentSubscription: builder.query({
      query: () => ({
        url: '/subscription',
        method: 'GET',
      }),
    }),

    createSubscriptionOrder: builder.mutation({
      query: (planData) => ({
        url: '/subscription/create-order',
        method: 'POST',
        body: planData,
      }),
    }),

    createRecurringSubscription: builder.mutation({
      query: (planData) => ({
        url: '/subscription/create-subscription',
        method: 'POST',
        body: planData,
      }),
    }),

    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/subscription/verify-payment',
        method: 'POST',
        body: paymentData,
      }),
    }),

    verifySubscriptionPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/subscription/verify-subscription-payment',
        method: 'POST',
        body: paymentData,
      }),
    }),

    cancelSubscription: builder.mutation({
      query: () => ({
        url: '/subscription/cancel',
        method: 'POST',
      }),
    }),

    activateFreePlan: builder.mutation({
      query: () => ({
        url: '/subscription/activate-free',
        method: 'POST',
      }),
    }),

  }),
});

export const {
  useLoginWithEmailMutation,
  useExchangeGoogleCodeMutation,
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
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  // Profile management hooks
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useDeleteUserAccountMutation,
  useGetUserStatsQuery,
  // Subscription management hooks
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionOrderMutation,
  useCreateRecurringSubscriptionMutation,
  useVerifyPaymentMutation,
  useVerifySubscriptionPaymentMutation,
  useCancelSubscriptionMutation,
  useActivateFreePlanMutation,
} = apiSlice;
