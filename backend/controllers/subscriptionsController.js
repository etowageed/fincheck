const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to restrict access to a route based on the user's subscription tier.
 * * @param {string} requiredStatus - The minimum required status ('premium').
 * @returns {function} Express middleware function.
 */
exports.restrictToTier = (requiredStatus) => {
  return (req, res, next) => {
    const userStatus = req.user.subscriptionStatus;

    // Check if the user meets the required status
    if (requiredStatus === 'premium' && userStatus !== 'premium') {
      return next(
        new AppError(
          'Access Denied. This feature requires a Premium subscription.',
          403
        )
      );
    }

    // Optional: Add expiration check here if needed.
    // For now, assume the webhook updates status to 'canceled' when expired.

    next();
  };
};

/**
 * Middleware to enforce the lookback limit on data query parameters for free users.
 * If the user is 'free', it overrides the query parameter to 'currentMonth'.
 * * @param {number} premiumMaxDays - The maximum days for a premium historical request.
 * @returns {function} Express middleware function.
 */
exports.enforceLookbackLimit = (premiumMaxDays = 3650) => {
  return (req, res, next) => {
    if (req.user.subscriptionStatus === 'free') {
      // Force free users to only view the current month's data/trends
      req.query.period = 'currentMonth';
      delete req.query.days; // Ensure no historical 'days' query is used
    } else {
      // Ensure premium user requests for days don't exceed sanity limits
      let requestedDays = parseInt(req.query.days, 10);
      if (requestedDays > premiumMaxDays) {
        req.query.days = premiumMaxDays;
      }
    }
    next();
  };
};
