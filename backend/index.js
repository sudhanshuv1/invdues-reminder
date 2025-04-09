require('dotenv').config();
require('express-async-errors');
require('./config/passport-config');
const passport = require('passport');
const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logger');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const PORT = process.env.PORT || 5000;

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

dbConnect();

// Initialize Passport.js
app.use(passport.initialize());


// Protect the dashboard route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.displayName}`);
  } else {
    res.redirect('/');
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('<h1>Welcome! <a href="/auth/google">Login with Google</a></h1>');
});


app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/invoices', require('./routes/invoiceRoutes'));

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});