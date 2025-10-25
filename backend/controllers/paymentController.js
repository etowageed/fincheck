const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Creates a Stripe Checkout Session and redirects the user.
 * This is the public endpoint called by the frontend.
 */
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get the current user ID
  const userId = req.user.id;
  const priceId = process.env.STRIPE_PRICE_ID_PREMIUM; // Assumes a single Premium price

  if (!priceId) {
    return next(new AppError('Stripe price ID is not configured.', 500));
  }

  // 2. Create the Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${FRONTEND_URL}/transactions?payment=success`,
    cancel_url: `${FRONTEND_URL}/pricing?payment=cancel`,
    customer_email: req.user.email, // Pre-fill email
    // Pass essential metadata to the webhook listener
    metadata: {
      userId: userId,
      statusToSet: 'premium',
    },
  });

  // 3. Send the session URL back to the client for redirection
  res.status(200).json({
    status: 'success',
    sessionUrl: session.url,
  });
});

/**
 * Handles Stripe Webhook events to update the user's subscription status.
 * This is the external flipper that changes the source of truth in the database.
 */
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Validate the incoming request signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Stripe Webhook Error: ${err.message}`);
    // Return a 400 response for any verification failure
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  const eventType = event.type;

  // 2. Handle specific subscription events
  switch (eventType) {
    case 'checkout.session.completed':
      // Payment successful, subscription created.
      // We get the user ID from the metadata we sent during session creation.
      const userId = data.metadata.userId;
      const statusToSet = data.metadata.statusToSet;

      // Ensure we have the user and status before proceeding
      if (!userId || !statusToSet) {
        return res.status(400).send('Webhook Error: Missing user metadata.');
      }

      // Retrieve the Subscription object
      const subscription = await stripe.subscriptions.retrieve(
        data.subscription
      );

      // Calculate expiration date
      const subscriptionExpires = new Date(
        subscription.current_period_end * 1000
      );

      // UPDATE the user's source of truth
      await User.findByIdAndUpdate(
        userId,
        {
          subscriptionStatus: statusToSet,
          subscriptionExpires: subscriptionExpires,
          stripeCustomerId: data.customer, // Store Stripe Customer ID for future use
          stripeSubscriptionId: data.subscription, // Store Subscription ID for managing cancellations
        },
        { new: true, runValidators: false }
      );

      console.log(
        `✅ User ${userId} upgraded to ${statusToSet}. Expires: ${subscriptionExpires.toISOString()}`
      );
      break;

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      // Subscription was canceled or payment failed (soft deletion)
      const customerId = data.customer;

      // Find the user by the stored Stripe Customer ID
      const user = await User.findOne({ stripeCustomerId: customerId });

      if (user) {
        // Soft downgrade/cancel: update the status and expiration
        await User.findByIdAndUpdate(
          user.id,
          {
            subscriptionStatus: 'canceled',
            subscriptionExpires: new Date(), // Set expiration to now or the end of the paid period
          },
          { new: true, runValidators: false }
        );
        console.log(`⚠️ User ${user.id} subscription canceled.`);
      }
      break;

    // Add other event types here (e.g., 'customer.subscription.updated')

    default:
      // Handle other event types
      console.log(`Unhandled event type: ${eventType}`);
  }

  // 3. Send a 200 response back to Stripe
  res.status(200).json({ received: true });
});
