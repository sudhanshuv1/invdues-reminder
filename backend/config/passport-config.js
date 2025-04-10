const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Local Strategy for email and password login
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const foundUser = await User.findOne({ email });

      // Check if user exists
      if (!foundUser) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check if the user has a password (email/password login)
      if (!foundUser.password) {
        return done(null, false, { message: 'This account is registered via Google OAuth' });
      }

      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, foundUser.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, foundUser);
    } catch (error) {
      return done(error);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    async (profile, done) => {
      try {
        // Check if a user with the Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        // If no user exists, create a new one
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            profilePhoto: profile.photos[0]?.value, // Optional profile photo
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to store in session (if sessions are used)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (if sessions are used)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;