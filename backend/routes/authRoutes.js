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
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // Browser redirect happens here
);

// Google OAuth Callback - Handle Google's redirect after login
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }), // On failure, redirect back to home
  authController.loginWithGoogle // Handle token generation and send JSON response
);

// Refresh Token Endpoint
router.post('/refresh', authController.refresh);

// Logout Endpoint
router.post('/logout', authController.logout);

module.exports = router;