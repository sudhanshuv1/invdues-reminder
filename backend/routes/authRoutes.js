const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Email and Password Login
router.post(
  '/',
  passport.authenticate('local', { session: false }), // Disable session as we're using JWT
  authController.loginWithEmail
);

// Google OAuth Login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false , failureRedirect: '/'}),
  authController.loginWithGoogle
);

// Refresh Token Endpoint
router.post('/refresh', authController.refresh);

// Logout Endpoint
router.post('/logout', authController.logout);

module.exports = router;
