const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust the path to your User model

// @desc Login with email and password
// @route POST /auth
// @access Public
const loginWithEmail = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(401).json({ message: 'We don\'t have a user with that email' });
        }

        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        const payload = {
            User: {
                id: foundUser.id,
                email: email,
            },
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ foundUser: foundUser, accessToken: accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// @desc Login with Google OAuth
// @route GET /auth/google/callback
// @access Public
const loginWithGoogle = async (req, res) => {
    try {
        const user = req.user; // Passport attaches the authenticated user to req.user

        const payload = {
            User: {
                id: user.id,
                email: user.email,
            },
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// @desc Refresh Token
// @route POST /auth/refresh
// @access Public
const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const refreshToken = cookies.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        try {
            const foundUser = await User.findById(decoded.User.id);

            if (!foundUser) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const payload = {
                User: {
                    id: decoded.User.id,
                    email: decoded.User.email,
                },
            };

            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            res.json({ accessToken });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
};

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(204); // No content
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: 'Cookie cleared' });
};

module.exports = {
    loginWithEmail,
    loginWithGoogle,
    refresh,
    logout,
};