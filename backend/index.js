require('dotenv').config();
require('./config/passport-config');
const passport = require('passport');
const express = require('express');
const app = express();
const { logger } = require('./middleware/logger');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const PORT = process.env.PORT || 5000;

app.use(logger);

app.use(cors(corsOptions));

// Parse JSON bodies.
app.use(express.json());
// Parse URL-encoded bodies.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

dbConnect();

app.use(passport.initialize());

app.use('/auth', require('./routes/authRoutes'));
app.use('/oauth', require('./routes/oauthRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/invoice', require('./routes/invoiceRoutes'));
app.use('/reminder', require('./routes/reminderRoutes'));

app.get('/', (req, res) => {
    res.send('<p>Invdues Reminder\'s backend API is running...</p>');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});