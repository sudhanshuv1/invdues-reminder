// frontend/src/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Safe JSON parsing function
const safeJsonParse = (value, fallback = null) => {
  try {
    if (value === null || value === undefined || value === 'undefined') {
      return fallback;
    }
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const initialState = {
  user: safeJsonParse(localStorage.getItem('user')),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken') || null,
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

      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
    },
    // Action to clear user information and authentication status
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;