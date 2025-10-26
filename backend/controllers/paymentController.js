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
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET // use the declared const
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  const eventType = event.type;

  // Debugging help (safe in dev)
  console.log(`Received Stripe event: ${eventType} (id: ${event.id})`);
  // console.log('Data keys:', Object.keys(data));
  // console.log('Metadata:', data?.metadata);

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const userId = data?.metadata?.userId;
        const statusToSet = data?.metadata?.statusToSet;

        if (!userId || !statusToSet) {
          console.warn(
            `checkout.session.completed missing metadata (event: ${event.id}). Ignoring.`
          );
          return res
            .status(200)
            .json({ received: true, note: 'No metadata, ignored' });
        }

        const subscription = await stripe.subscriptions.retrieve(
          data.subscription
        );

        // ✅ FIX: Safely convert Unix timestamp (seconds) to JS Date object (milliseconds)
        const expiryTimestamp = subscription.current_period_end;
        const subscriptionExpires = expiryTimestamp
          ? new Date(expiryTimestamp * 1000)
          : null; // Set to null if timestamp is missing or zero

        await User.findByIdAndUpdate(
          userId,
          {
            subscriptionStatus: statusToSet,
            subscriptionExpires, // Pass the safely converted Date object or null
            stripeCustomerId: data.customer,
            stripeSubscriptionId: data.subscription,
          },
          { new: true, runValidators: false }
        );

        console.log(`✅ Upgraded user ${userId} to ${statusToSet}`);
        break;
      }

      case 'invoice.payment_failed':
      case 'customer.subscription.deleted': {
        const customerId = data.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          await User.findByIdAndUpdate(user.id, {
            subscriptionStatus: 'canceled',
            subscriptionExpires: new Date(),
          });
          console.log(`⚠️ User ${user.id} subscription canceled.`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error handling webhook: ${err.message}`);
    res.status(500).send(`Webhook handling failed: ${err.message}`);
  }
};
