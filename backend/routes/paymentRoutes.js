const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// --- UNPROTECTED ROUTE: Webhook Listener ---
// Stripe needs to hit this directly without authentication
// router.post('/webhook', paymentController.handleWebhook);

// --- PROTECTED ROUTE: Checkout Session Creation ---
// Only authenticated users can initiate a checkout session
router.use(authController.protect);
router.post('/checkout', paymentController.createCheckoutSession);
router.post('/portal', paymentController.createCustomerPortalSession);

module.exports = router;
