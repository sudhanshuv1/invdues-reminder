require('dotenv').config();
require('./config/passport-config');

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const corsOptions = require('./config/corsOptions');
const dbConnect = require('./config/dbConnect');

const app = express();

// Enable CORS using your custom options.
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests on all routes.
app.options('*', cors(corsOptions));

// Parse JSON and URL-encoded bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie parser.
app.use(cookieParser());

// Connect to the database.
dbConnect();

// Initialize Passport.
app.use(passport.initialize());

// Enable cron jobs for traditional hosting
require(path.join(__dirname, 'utils', 'reminderScheduler'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Define your routes.
app.use('/auth', require('./routes/authRoutes'));
app.use('/oauth', require('./routes/oauthRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/invoice', require('./routes/invoiceRoutes'));
app.use('/zapier', require('./routes/zapierRoutes'));
app.use('/reminder', require('./routes/reminderRoutes'));
app.use('/mail-config', require('./routes/mailConfigRoutes'));
app.use('/subscription', require('./routes/subscriptionRoutes'));

// Default route.
app.get('/', (req, res) => {
  res.send("<p>Invdues Reminder's backend API is running...</p>");
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Ensure CORS headers are set for error responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://invdues-reminder-eta.vercel.app',
    'https://invdues-reminder.vercel.app'
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  console.error('=== APPLICATION ERROR ===');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  console.error('Request body:', req.body);
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// 404 handler
app.use((req, res) => {
  // Ensure CORS headers are set for 404 responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://invdues-reminder-eta.vercel.app',
    'https://invdues-reminder.vercel.app'
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
