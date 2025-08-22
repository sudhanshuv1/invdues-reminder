const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Email and Password Login
router.post(
  '/',
  passport.authenticate('local', { session: false }), // Passport local strategy for email and password
  authController.loginWithEmail
);

// Google OAuth Login - Redirect to Google's authorization page
router.get('/google', (req, res, next) => {
  console.log('=== INITIATING GOOGLE OAUTH ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Callback URL would be:', 
    process.env.NODE_ENV === 'production' 
      ? 'https://invdues-backend.onrender.com/auth/google/callback'
      : 'http://localhost:5000/auth/google/callback'
  );
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

// Google OAuth Callback - Handle Google's redirect after login
router.get('/google/callback', (req, res, next) => {
  console.log('=== GOOGLE CALLBACK RECEIVED ===');
  console.log('Query params:', req.query);
  console.log('Full URL:', req.url);
  
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/signin?error=oauth_failed`,
    session: false 
  })(req, res, (err) => {
    if (err) {
      console.error('Passport authentication error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_error`);
    }
    
    // If successful, call the controller
    authController.loginWithGoogle(req, res);
  });
});

// Debug endpoint for production troubleshooting
router.get('/debug/config', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.NODE_ENV === 'production' 
      ? 'https://invdues-backend.onrender.com/auth/google/callback'
      : 'http://localhost:5000/auth/google/callback'
  });
});

// Refresh Token Endpoint
router.post('/refresh', authController.refresh);

// Logout Endpoint
router.post('/logout', authController.logout);

module.exports = router;