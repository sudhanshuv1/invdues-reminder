require('dotenv').config();
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



app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/invoice', require('./routes/invoiceRoutes'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});