// controllers/oauthController.js

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory storage for authorization codes.
// In production, replace this with a database or caching solution with expiry.
const authCodes = new Map();

// Load allowed redirect URIs from environment variables (comma-separated list).
const allowedRedirects = process.env.AUTHORIZED_REDIRECT_URIS
  ? process.env.AUTHORIZED_REDIRECT_URIS.split(',').map(uri => uri.trim())
  : [];

/**
 * GET /oauth/authorize
 * Zapier calls this endpoint when a user starts the OAuth flow.
 * Expected query parameters: response_type, client_id, redirect_uri, state.
 * This endpoint validates parameters, ensures the redirect_uri is authorized,
 * and then redirects the user to your front-end OAuth login page.
 */
const authorize = (req, res) => {
  const { response_type, client_id, redirect_uri, state } = req.query;

  // Validate required parameters.
  if (!response_type || !client_id || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Validate that the redirect_uri is in the allowed list.
  if (!allowedRedirects.includes(redirect_uri)) {
    return res.status(400).json({ error: 'Unauthorized redirect URI' });
  }

  // Validate the client_id.
  if (client_id !== process.env.ZAPIER_CLIENT_ID) {
    return res.status(400).json({ error: 'Invalid client id' });
  }

  // Ensure response_type is "code".
  if (response_type !== 'code') {
    return res.status(400).json({ error: 'Invalid response_type' });
  }

  // Redirect the user to your front-end login page.
  // The front end should handle login and then call your /oauth/login/callback endpoint.
  const loginUrl = `${process.env.FRONTEND_URL}/dashboard/oauth-consent?redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&state=${encodeURIComponent(state)}`;

  return res.redirect(loginUrl);
};

/**
 * POST /oauth/login/callback
 * Called by your front-end after a successful login.
 * Request body must contain: { redirect_uri, state }.
 * Generates a one-time authorization code and redirects back to the provided redirect_uri with that code.
 */
const loginCallback = async (req, res) => {
  const { redirect_uri, state } = req.body;
  const userId = req.user ? req.user.id : req.body.userId; // Supports both methods
  if (!userId || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required fields: userId or redirect_uri' });
  }

  // Validate that the redirect_uri is allowed.
  if (!allowedRedirects.includes(redirect_uri)) {
    return res.status(400).json({ error: 'Unauthorized redirect URI' });
  }

  // Generate a one-time authorization code.
  const code = crypto.randomBytes(16).toString('hex');
  authCodes.set(code, userId);
  // (Optional: set an expiration timeout here.)

  // Build the final URL that includes the code and state.
  const finalUrl = `${redirect_uri}?code=${code}&state=${encodeURIComponent(state)}`;

  // Check if frontend requested a JSON response.
  if (req.query.json === 'true') {
    return res.json({ redirect: finalUrl });
  }

  // Otherwise, do a standard HTTP redirect.
  return res.redirect(finalUrl);
};


/**
 * POST /oauth/token
 * Zapier calls this endpoint to exchange the dashboard authorization code for tokens.
 * Expected request body: { code, client_id, client_secret, redirect_uri }.
 */
const token = async (req, res) => {
  const { code, client_id, client_secret, redirect_uri } = req.body;
  console.log("OAuth Token Request Body:", req.body);
  if (!code || !client_id || !client_secret || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Validate that the redirect_uri is allowed.
  if (!allowedRedirects.includes(redirect_uri)) {
    return res.status(400).json({ error: 'Unauthorized redirect URI' });
  }

  // Validate client credentials.
  if (client_id !== process.env.ZAPIER_CLIENT_ID || client_secret !== process.env.ZAPIER_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Invalid client credentials' });
  }

  // Validate the authorization code.
  const userId = authCodes.get(code);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid or expired authorization code' });
  }

  // Remove the authorization code to ensure one-time use.
  authCodes.delete(code);

  try {
    // Look up the user in your database.
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Create the token payload.
    const payload = {
      User: {
        id: foundUser._id.toString(),
        email: foundUser.email,
      },
    };

    // Generate an access token and a refresh token.
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
};

/**
 * POST /oauth/refresh
 * Endpoint to refresh an access token using a refresh token.
 * Expected request body: { refresh_token, client_id, client_secret }.
 */
const refresh = async (req, res) => {
  const { refresh_token, client_id, client_secret } = req.body;
  if (!refresh_token || !client_id || !client_secret) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Validate client credentials.
  if (client_id !== process.env.ZAPIER_CLIENT_ID || client_secret !== process.env.ZAPIER_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Invalid client credentials' });
  }

  // Verify the refresh token.
  jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid or expired refresh token' });
    }

    // Prepare payload for a new access token.
    const payload = {
      User: {
        id: decoded.User.id,
        email: decoded.User.email,
      },
    };

    // Generate a new access token.
    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    // Optionally, you can also rotate the refresh token here.
    return res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
    });
  });
};

/**
 * GET /oauth/me
 * Returns basic information about the currently authenticated user.
 * Expects an Authorization header in the format: "Bearer <access_token>".
 */
const me = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    try {
      // Retrieve the user based on the ID stored in the token payload.
      const foundUser = await User.findById(decoded.User.id).select('-password'); // Exclude sensitive fields.
      if (!foundUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(foundUser);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  });
};

module.exports = { authorize, loginCallback, token, refresh, me };
