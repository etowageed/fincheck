const polar = require('../utils/polar');
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
  // 1. Get the current user ID and email
  const userId = req.user.id;
  const userEmail = req.user.email;
  const productId = process.env.POLAR_PRODUCT_PRICE_ID_PREMIUM;

  if (!productId) {
    return next(new AppError('Premium product ID is not configured.', 500));
  }

  // 2. Create the Checkout Session using Polar SDK
  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: userEmail,
      successUrl: `${FRONTEND_URL}/transactions?payment=success`,
      metadata: {
        userId,
        statusToSet: 'premium',
      },
    });

    // 3. Send the session URL back to the client for redirection
    res.status(200).json({
      status: 'success',
      sessionUrl: checkout.url,
    });
  } catch (error) {
    console.error('Polar Checkout Creation Failed:', error);

    // Try to extract a clean message from the SDK error
    let message = 'Failed to initiate checkout session';

    // Check if it's a validation error with details
    // The SDK often returns JSON in the message for API errors
    try {
      // Sometimes the error.message is `API error occurred: {...json...}`
      const jsonMatch = error.message.match(/API error occurred: (\{.*\})/);
      if (jsonMatch && jsonMatch[1]) {
        const errorData = JSON.parse(jsonMatch[1]);
        // Check for Pydantic/FastAPI style validation errors
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Find the first meaningful error
          const firstError = errorData.detail[0];
          if (firstError.msg && firstError.loc) {
            // e.g. "richgang@example.com is not a valid email address..."
            message = firstError.msg;
          }
        } else if (errorData.error) {
          message = errorData.error;
        }
      } else if (error.body && error.body.detail) {
        // Sometimes it might be attached differently
        message = error.body.detail[0]?.msg || message;
      }
    } catch (parseErr) {
      // If parsing fails, fall back to the generic message or original if safe
      console.warn('Failed to parse Polar error details', parseErr);
      message = error.message; // Fallback
    }

    return next(new AppError(message, 500));
  }
});

/**
 * Handles Webhook events to update the user's subscription status.
 * This is the external flipper that changes the source of truth in the database.
 */
exports.handleWebhook = async (req, res) => {
  // Verify the webhook signature
  let event;
  try {
    const webhookBody = req.body.toString('utf8');
    const webhookHeaders = req.headers;

    // Validate the event using Polar SDK
    if (!process.env.POLAR_WEBHOOK_SECRET) {
      throw new Error('POLAR_WEBHOOK_SECRET is not defined');
    }

    const result = await polar.validateWebhook({
      request: {
        body: webhookBody,
        headers: webhookHeaders,
        method: 'POST',
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      },
      secret: process.env.POLAR_WEBHOOK_SECRET,
    });

    event = result;
  } catch (err) {
    console.error(`❌ Webhook verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventType = event.type;
  const { data } = event;

  console.log(`Received Polar event: ${eventType} (id: ${event.id})`);

  try {
    switch (eventType) {
      case 'checkout.created': {
        // Just created, might not be paid yet.
        // We can capture the customer ID here if needed later.
        const userId = data.metadata?.userId;
        if (userId && data.customerId) {
          await User.findByIdAndUpdate(userId, {
            polarCustomerId: data.customerId,
          });
        }
        break;
      }

      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.active': {
        const userId = data.metadata?.userId;
        const { status } = data;
        const polarSubscriptionId = data.id;

        let user;
        if (userId) {
          user = await User.findById(userId);
        } else if (data.customerId) {
          user = await User.findOne({ polarCustomerId: data.customerId });
        }

        if (!user) {
          console.warn(`User not found for subscription event: ${event.id}`);
          return res.status(200).json({ received: true });
        }

        const updates = {
          polarSubscriptionId,
          subscriptionStatus: status === 'active' ? 'premium' : 'free',
        };

        if (data.currentPeriodEnd) {
          updates.subscriptionExpires = new Date(data.currentPeriodEnd);
        }

        await User.findByIdAndUpdate(user.id, updates, { new: true });
        console.log(
          `✅ Updated user ${user.id} subscription status to ${updates.subscriptionStatus}`,
        );

        if (eventType === 'subscription.created' && status === 'active') {
          try {
            const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            await new EmailService(user, appUrl).sendPremiumWelcome();
          } catch (err) {
            console.error('Failed to send welcome email', err);
          }
        }

        break;
      }

      case 'subscription.revoked':
      case 'subscription.canceled': {
        const polarSubscriptionId = data.id;
        const user = await User.findOne({ polarSubscriptionId });

        if (user) {
          await User.findByIdAndUpdate(user.id, {
            subscriptionStatus: 'canceled',
            subscriptionExpires: new Date(),
          });
          console.log(`⚠️ User ${user.id} subscription canceled.`);
        }
        break;
      }

      // Explicitly ignore these events to prevent log noise
      case 'customer.created':
      case 'customer.updated':
      case 'customer.state_changed':
      case 'checkout.updated':
      case 'order.created':
      case 'order.updated':
      case 'order.paid':
        // console.log(`ℹ️ Ignored info event: ${eventType}`);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error handling webhook: ${err.message}`);
    res.status(500).send(`Webhook handling failed: ${err.message}`);
  }
};
