// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
// const FacebookStrategy = require('passport-facebook');
const User = require('../models/userModel'); // Your User model

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
    },
    async (issuer, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return cb(null, user);
        } else {
          // Check if a user with this email already exists (for linking accounts)
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link existing email user to Google account
              user.googleId = profile.id;
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
          });
          await newUser.save();
          return cb(null, newUser);
        }
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

// ------------------------------------
// Facebook Strategy (Similar logic)
// ------------------------------------
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: '/api/v1/auth/facebook/callback', // Ensure this matches your route
//       profileFields: ['id', 'displayName', 'emails'], // Request necessary fields
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         let user = await User.findOne({ facebookId: profile.id });

//         if (user) {
//           return cb(null, user);
//         } else {
//           if (profile.emails && profile.emails.length > 0) {
//             user = await User.findOne({ email: profile.emails[0].value });
//             if (user) {
//               user.facebookId = profile.id;
//               await user.save();
//               return cb(null, user);
//             }
//           }
//           const newUser = new User({
//             facebookId: profile.id,
//             name: profile.displayName,
//             email:
//               profile.emails && profile.emails.length > 0
//                 ? profile.emails[0].value
//                 : null,
//           });
//           await newUser.save();
//           return cb(null, newUser);
//         }
//       } catch (err) {
//         return cb(err, null);
//       }
//     }
//   )
// );

// TODO:facebook Oauth
// Export passport to be used in your app.js
module.exports = passport;
