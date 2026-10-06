const AiUsage = require('../models/aiUsageModel');
const AI_FEATURE_POLICY = require('../config/aiFeaturePolicy');
const AppError = require('../utils/appError');

/**
 * Returns current period as YYYY-MM based on UTC date
 */
const getCurrentPeriod = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Returns next month's reset date (1st day of next month at 00:00:00 UTC)
 */
const getNextResetDate = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
};

/**
 * Validates whether user has active Premium subscription
 */
const isUserPremium = (user) => {
  if (!user || !user.subscriptionStatus) return false;
  if (user.subscriptionStatus !== 'premium') return false;

  // If expiration date exists, ensure it is still in the future
  if (user.subscriptionExpires && new Date(user.subscriptionExpires) < new Date()) {
    return false;
  }

  return true;
};

/**
 * Checks if user has remaining quota for a feature without consuming it
 */
const checkQuota = async (userId, featureKey, user) => {
  const featureConfig = AI_FEATURE_POLICY.features[featureKey];
  if (!featureConfig) {
    throw new AppError(`Invalid AI feature key: ${featureKey}`, 400);
  }

  const period = getCurrentPeriod();
  const userIsPremium = isUserPremium(user);

  if (userIsPremium) {
    return {
      allowed: true,
      isPremium: true,
      featureKey,
      limit: null,
      usage: 0,
      remaining: 'Unlimited',
      period,
      resetDate: getNextResetDate(),
    };
  }

  const limit = featureConfig.freeMonthlyLimit;
  const usageRecord = await AiUsage.findOne({ userId, period, featureKey });
  const usage = usageRecord ? usageRecord.count : 0;
  const remaining = Math.max(0, limit - usage);
  const allowed = usage < limit;

  return {
    allowed,
    isPremium: false,
    featureKey,
    limit,
    usage,
    remaining,
    period,
    resetDate: getNextResetDate(),
  };
};

/**
 * Atomically checks and increments quota count for a feature.
 * Throws AppError 403 if Free limit is reached.
 */
const consumeQuota = async (userId, featureKey, user) => {
  const featureConfig = AI_FEATURE_POLICY.features[featureKey];
  if (!featureConfig) {
    throw new AppError(`Invalid AI feature key: ${featureKey}`, 400);
  }

  const userIsPremium = isUserPremium(user);
  const period = getCurrentPeriod();

  if (userIsPremium) {
    return {
      allowed: true,
      isPremium: true,
      featureKey,
      limit: null,
      usage: 0,
      remaining: 'Unlimited',
      period,
    };
  }

  const limit = featureConfig.freeMonthlyLimit;

  // Use atomic findOneAndUpdate to prevent race conditions
  // We check if current count < limit before incrementing
  let usageRecord = await AiUsage.findOne({ userId, period, featureKey });

  if (usageRecord && usageRecord.count >= limit) {
    throw new AppError(
      `Monthly quota reached for ${featureConfig.name} (${limit}/${limit}). Upgrade to Premium for unlimited AI access.`,
      403,
      { code: 'QUOTA_EXHAUSTED', featureKey, limit }
    );
  }

  try {
    usageRecord = await AiUsage.findOneAndUpdate(
      { userId, period, featureKey, count: { $lt: limit } },
      {
        $inc: { count: 1 },
        $set: { lastUsedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    // If upsert hit duplicate key because count was >= limit in race condition
    if (err.code === 11000) {
      const current = await AiUsage.findOne({ userId, period, featureKey });
      if (current && current.count >= limit) {
        throw new AppError(
          `Monthly quota reached for ${featureConfig.name} (${limit}/${limit}). Upgrade to Premium for unlimited AI access.`,
          403,
          { code: 'QUOTA_EXHAUSTED', featureKey, limit }
        );
      }
    }
    throw err;
  }

  if (!usageRecord) {
    throw new AppError(
      `Monthly quota reached for ${featureConfig.name} (${limit}/${limit}). Upgrade to Premium for unlimited AI access.`,
      403,
      { code: 'QUOTA_EXHAUSTED', featureKey, limit }
    );
  }

  const usage = usageRecord.count;
  const remaining = Math.max(0, limit - usage);

  return {
    allowed: true,
    isPremium: false,
    featureKey,
    limit,
    usage,
    remaining,
    period,
  };
};

/**
 * Gets overall quota status for all 8 features for a user
 */
const getUserQuotaStatus = async (user) => {
  const period = getCurrentPeriod();
  const userIsPremium = isUserPremium(user);
  const resetDate = getNextResetDate();

  const usageRecords = await AiUsage.find({ userId: user._id, period });
  const usageMap = {};
  usageRecords.forEach((rec) => {
    usageMap[rec.featureKey] = rec.count;
  });

  const featuresStatus = {};

  Object.keys(AI_FEATURE_POLICY.features).forEach((key) => {
    const config = AI_FEATURE_POLICY.features[key];
    const usage = usageMap[key] || 0;
    const limit = userIsPremium ? null : config.freeMonthlyLimit;
    const remaining = userIsPremium ? 'Unlimited' : Math.max(0, config.freeMonthlyLimit - usage);
    const allowed = userIsPremium || usage < config.freeMonthlyLimit;

    featuresStatus[key] = {
      key: config.key,
      name: config.name,
      description: config.description,
      isPremium: userIsPremium,
      limit,
      usage: userIsPremium ? 0 : usage,
      remaining,
      allowed,
      resetDate,
    };
  });

  return {
    isPremium: userIsPremium,
    period,
    resetDate,
    features: featuresStatus,
  };
};

module.exports = {
  getCurrentPeriod,
  getNextResetDate,
  isUserPremium,
  checkQuota,
  consumeQuota,
  getUserQuotaStatus,
};
