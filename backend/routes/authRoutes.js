const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const passport = require('../config/passport');

const router = express.Router();
const {
  createToken,
  sendTokenWithCookie,
} = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
});

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.get('/logout', authController.logout);
router.get('/isLoggedIn', authController.isLoggedIn);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/:id/updatepassword', authController.updatePassword);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Google Auth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${frontendUrl}/login` }),
  (req, res) => {
    const token = createToken(req.user.id);
    sendTokenWithCookie(res, token);
    res.redirect(`${frontendUrl}/transactions`);
  }
);

// Facebook Auth Routes
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${frontendUrl}/login`,
  }),
  (req, res) => {
    const token = createToken(req.user.id);
    sendTokenWithCookie(res, token);
    res.redirect(`${frontendUrl}/transactions`);
  }
);

module.exports = router;
