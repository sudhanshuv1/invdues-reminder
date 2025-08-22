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
        console.log('=== LOGIN WITH GOOGLE CONTROLLER ===');
        console.log('User from passport:', req.user ? 'User present' : 'No user');
        
        const user = req.user;
        
        if (!user) {
            console.error('No user found in req.user after passport authentication');
            return res.redirect(`${process.env.FRONTEND_URL}/signin?error=no_user_data`);
        }

        console.log('User data:', {
            id: user.id,
            email: user.email,
            displayName: user.displayName
        });

        const payload = {
            User: {
                id: user.id,
                email: user.email,
            },
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: '15m' 
        });
        
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { 
            expiresIn: '7d' 
        });

        console.log('JWT tokens generated successfully');

        // Set cookies
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 15 * 60 * 1000,
        });

        console.log('Cookies set successfully');

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL;
        const redirectUrl = `${frontendUrl}/signin?` +
            `accessToken=${encodeURIComponent(accessToken)}&` +
            `refreshToken=${encodeURIComponent(refreshToken)}&` +
            `name=${encodeURIComponent(user.displayName || '')}&` +
            `email=${encodeURIComponent(user.email || '')}&` +
            `success=true`;

        console.log('Redirecting to frontend...');
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('=== LOGIN WITH GOOGLE ERROR ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        res.redirect(`${process.env.FRONTEND_URL}/signin?error=server_error&details=${encodeURIComponent(error.message)}`);
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