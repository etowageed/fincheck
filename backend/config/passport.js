// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const FacebookStrategy = require('passport-facebook');
const User = require('../models/userModel'); // Your User model
const EmailService = require('../utils/emails');

// ------------------------------------
// Passport Serialization/Deserialization
// ------------------------------------
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ------------------------------------
// Google Strategy
// ------------------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback', // Ensure this matches your route
      scope: ['profile', 'email'],
      passReqToCallback: true,
    },
    async (req, issuer, profile, cb) => {
      try {
        // Get the user's IP address, handling proxies
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0] : req.ip;

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last known IP address
          user.lastKnownIP = ip;
          await user.save({ validateBeforeSave: false });

          // Ensure existing users don't get redirected to onboarding
          user.isNewUser = false;

          return cb(null, user);
          // eslint-disable-next-line no-else-return
        } else {
          // Check if a user with this email already exists (for linking accounts)
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link existing email user to Google account
              user.googleId = profile.id;
              user.lastKnownIP = ip; // Update last known IP address
              await user.save();
              return cb(null, user);
            }
          }
          // Create a new user if no existing user or email found
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName || profile.name.givenName, // Or extract first/last name
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            // You might not get a password from social login, so it'll be null or undefined
            lastKnownIP: ip, // Save the last known IP address
          });
          await newUser.save();

          // Flag as new user for the redirect logic
          newUser.isNewUser = true;

          // Send welcome email if needed
          if (newUser.email) {
            try {
              // You need to define the base URL for your application.
              // This could be from an environment variable (e.g., process.env.APP_URL)
              // or hardcoded for now if you know it (e.g., 'http://localhost:3000').
              const appBaseUrl = `${process.env.FRONTEND_URL}/transactions`; // Define your app's base URL here
              // TODO: change this to prod url

              // Create an instance of EmailService
              const emailInstance = new EmailService(newUser, appBaseUrl);
              await emailInstance.sendWelcome(); // Call the instance method
              console.log(`Welcome email sent to ${newUser.email}`);
            } catch (emailError) {
              console.error(
                `Failed to send welcome email to ${newUser.email}:`,
                emailError
              );
            }
          }

          return cb(null, newUser);
        }
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

// ------------------------------------
// Facebook Strategy
// ------------------------------------
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/v1/auth/facebook/callback', // Ensure this matches your route
      profileFields: ['id', 'displayName', 'emails'], // Request necessary fields
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      try {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0] : req.ip;

        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          user.lastKnownIP = ip;
          await user.save({ validateBeforeSave: false });
          return cb(null, user);
          // eslint-disable-next-line no-else-return
        } else {
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              user.facebookId = profile.id;
              user.lastKnownIP = ip;
              await user.save();
              return cb(null, user);
            }
          }
          const newUser = new User({
            facebookId: profile.id,
            name: profile.displayName,
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            lastKnownIP: ip, // Save the last known IP address
          });
          await newUser.save();

          // Flag as new user for the redirect logic
          newUser.isNewUser = true;

          // Send welcome email if needed
          if (newUser.email) {
            try {
              const appBaseUrl = `${process.env.FRONTEND_URL}/transactions`; // Define your app's base URL here
              const emailInstance = new EmailService(newUser, appBaseUrl);
              await emailInstance.sendWelcome(); // Call the instance method
              console.log(`Welcome email sent to ${newUser.email}`);
            } catch (emailError) {
              console.error(
                `Failed to send welcome email to ${newUser.email}:`,
                emailError
              );
            }
          }

          return cb(null, newUser);
        }
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

module.exports = passport;
