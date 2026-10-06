const mongoose = require('mongoose');
const AI_FEATURE_POLICY = require('../config/aiFeaturePolicy');

const validFeatureKeys = Object.keys(AI_FEATURE_POLICY.features);

const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String, // Format: 'YYYY-MM'
      required: true,
      index: true,
    },
    featureKey: {
      type: String,
      required: true,
      enum: validFeatureKeys,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Unique compound index to ensure one counter per user per feature per month
aiUsageSchema.index({ userId: 1, period: 1, featureKey: 1 }, { unique: true });

const AiUsage = mongoose.model('AiUsage', aiUsageSchema);

module.exports = AiUsage;
