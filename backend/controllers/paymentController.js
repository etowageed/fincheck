const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const EmailService = require('../utils/emails');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Creates a Checkout Session and redirects the user.
 * This is the public endpoint called by the frontend.
 */
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // Placeholder for future payment provider (e.g., Polar.sh)
  res.status(200).json({
    status: 'success',
    sessionUrl: '#', // No-op URL
    message: 'Payment integration is currently disabled for migration.',
  });
});

/**
 * Handles Webhook events to update the user's subscription status.
 * This is the external flipper that changes the source of truth in the database.
 */
exports.handleWebhook = async (req, res) => {
  // Placeholder webhook handler
  console.log('Webhook received (Payment integration disabled)');
  res.status(200).json({ received: true });
};
