const jwt = require('jsonwebtoken'); // To create tokens

const querystring = require('querystring');
const axios = require('axios'); // For making HTTP requests

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Google Client ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Google Client Secret
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Redirect URI registered in Google Cloud Console

// @desc Redirect user to Google's OAuth consent screen
// @route GET /auth/google
// @access Public
const googleOAuthAuthorize = (req, res) => {
    const state = req.query.state; // Optional: Pass state parameter from Zapier if provided
    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'profile email',
        state, // Include state parameter for added security if provided
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams}`;
    res.redirect(googleAuthUrl); // Redirect user to Google's OAuth consent screen
};


const getMe = (req, res) => {
    try {
        // Assuming `req.user` is populated by your `authenticate` middleware
        const user = req.user;

        // Return basic user information
        res.status(200).json({
            message: 'Authentication successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to validate authentication', error: error.message });
    }
}

// @desc Handle the callback from Google with authorization code
// @route GET /auth/google/callback
// @access Public
const googleOAuthCallback = async (req, res) => {
    try {
        const { code } = req.query; // Extract authorization code from query parameters

        if (!code) {
            return res.status(400).send({ message: 'Authorization code missing' });
        }

        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            querystring.stringify({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, id_token } = tokenResponse.data; // Access token and ID token

        // You can verify the ID token if needed (to get user info)
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userInfo = userResponse.data;

        // Return user info and tokens to the client or Zapier
        res.status(200).json({
            message: 'Google login successful',
            user: userInfo,
            access_token,
        });
    } catch (error) {
        console.error('Error during Google OAuth callback:', error.message);
        res.status(500).send({ message: 'Failed to authenticate with Google', error: error.message });
    }
};


// @desc Generate the authorize URL for Zapier OAuth
// @route GET /oauth/authorize
// @access Public
const authorizeUrl = (req, res) => {
    const { redirectUri, scope } = req.query; // Get redirect URI and scope from Zapier

    if (!redirectUri) {
        return res.status(400).json({ message: 'Missing redirectUri in request' });
    }

    // Create the authorization URL
    const authorizeUrl = `${APP_URL}/oauth/consent?redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${encodeURIComponent(scope)}&client_id=${CLIENT_ID}&response_type=code`;

    res.status(200).json({ authorizeUrl });
};

// @desc Handle token exchange for Zapier OAuth
// @route POST /oauth/token
// @access Public
const handleTokenExchange = (req, res) => {
    const { code, redirect_uri } = req.body;

    // Validate the authorization code (e.g., checking against stored codes)
    if (code !== 'valid_code') {
        return res.status(400).json({ message: 'Invalid authorization code' });
    }

    // Generate access and refresh tokens
    const accessToken = jwt.sign({ userId: 'exampleUserId' }, CLIENT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: 'exampleUserId' }, CLIENT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
    });
};

// Other functions for webhook subscription and reminders
const subscribeWebhook = (req, res) => {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
        return res.status(400).json({ message: 'Webhook URL is required' });
    }

    subscribedWebhookUrls.push(webhookUrl);
    res.status(200).json({ message: 'Webhook subscribed successfully!' });
};

const unsubscribeWebhook = (req, res) => {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
        return res.status(400).json({ message: 'Webhook URL is required' });
    }

    subscribedWebhookUrls = subscribedWebhookUrls.filter((url) => url !== webhookUrl);
    res.status(200).json({ message: 'Webhook unsubscribed successfully!' });
};

const sendReminders = async (req, res) => {
    try {
        const { invoices } = req.body;

        if (!invoices || invoices.length === 0) {
            return res.status(400).json({ message: 'No invoices provided' });
        }

        for (const webhookUrl of subscribedWebhookUrls) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoices }),
            });
        }

        res.status(200).json({ message: 'Reminders sent successfully!', invoices });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reminders', error: error.message });
    }
};

module.exports = {
    authorizeUrl,
    googleOAuthAuthorize,
    googleOAuthCallback,
    handleTokenExchange,
    subscribeWebhook,
    unsubscribeWebhook,
    sendReminders,
    getMe,
};
