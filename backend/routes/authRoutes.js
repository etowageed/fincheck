const express = require('express');
const authController = require('../controllers/authController');
const passport = require('../config/passport');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/isLoggedIn', authController.isLoggedIn);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/:id/updatepassword', authController.updatePassword);

// Google Auth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home or to a dashboard
    res.redirect('/api/v1/users/me'); // Or wherever you redirect after login
  }
);

// Facebook Auth Routes
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/api/v1/users/me'); // Or wherever you redirect after login
  }
);

module.exports = router;
