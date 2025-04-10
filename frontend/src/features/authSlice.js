import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Stores user information (e.g., name, email)
  isAuthenticated: false, // Tracks if the user is logged in
  accessToken: null, // Stores the access token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set user information and authentication status
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.accessToken = accessToken;
    },
    // Action to clear user information and authentication status
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;