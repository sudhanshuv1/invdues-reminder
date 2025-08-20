const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // Check for token in Authorization header first (email/password auth or production fallback)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token found in Authorization header');
  } else if (req.cookies?.accessToken) {
    // Check for token in HTTP-only cookie (Google OAuth auth in development)
    token = req.cookies.accessToken;
    console.log('Token found in cookie');
  }

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.log('Token verified successfully for user:', decoded.User?.email);
    req.user = decoded.User; // Attach user data to the request
    next();
  });
};

module.exports = verifyJWT;
