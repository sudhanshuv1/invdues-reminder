// routes/oauthRoutes.js

const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');
const verifyJWT = require('../middleware/verifyJWT');

// When Zapier starts the OAuth process.
router.get('/authorize', oauthController.authorize);

router.get('/me', oauthController.me);

// Zapier calls this endpoint to exchange the authorization code for tokens.
router.post('/token', oauthController.token);
router.post('/refresh', oauthController.refresh);

router.use(verifyJWT);

// The front end calls this endpoint after a successful login.
// It generates and returns an authorization code.
router.post('/login/callback', oauthController.loginCallback);

module.exports = router;