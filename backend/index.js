require('dotenv').config();
require('./config/passport-config');

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const { logger } = require('./middleware/logger');
const corsOptions = require('./config/corsOptions');
const dbConnect = require('./config/dbConnect');

const app = express();
const PORT = process.env.PORT || 5000;

// Logger middleware.
app.use(logger);

// Enable CORS using your custom options.
// For debugging, you might try: app.use(cors());
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

// Import the scheduler so cron jobs are set up.
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

// Default route.
app.get('/', (req, res) => {
  res.send("<p>Invdues Reminder's backend API is running...</p>");
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
