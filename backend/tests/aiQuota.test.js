const quotaService = require('../services/quotaService');
const AI_FEATURE_POLICY = require('../config/aiFeaturePolicy');

describe('AI Quota & Feature Entitlement Unit Tests', () => {
  describe('getCurrentPeriod', () => {
    test('formats period as YYYY-MM correctly', () => {
      const testDate = new Date('2026-10-06T12:00:00Z');
      const period = quotaService.getCurrentPeriod(testDate);
      expect(period).toBe('2026-10');
    });
  });

  describe('isUserPremium', () => {
    test('returns false for null or free user', () => {
      expect(quotaService.isUserPremium(null)).toBe(false);
      expect(quotaService.isUserPremium({ subscriptionStatus: 'free' })).toBe(false);
      expect(quotaService.isUserPremium({ subscriptionStatus: 'canceled' })).toBe(false);
    });

    test('returns true for active premium user without expiration', () => {
      expect(quotaService.isUserPremium({ subscriptionStatus: 'premium' })).toBe(true);
    });

    test('returns true for active premium user with future expiration', () => {
      const future = new Date(Date.now() + 86400000); // Tomorrow
      expect(quotaService.isUserPremium({ subscriptionStatus: 'premium', subscriptionExpires: future })).toBe(true);
    });

    test('returns false for premium user with past expiration', () => {
      const past = new Date(Date.now() - 86400000); // Yesterday
      expect(quotaService.isUserPremium({ subscriptionStatus: 'premium', subscriptionExpires: past })).toBe(false);
    });
  });

  describe('AI Feature Policy Boundaries', () => {
    test('contains all 8 required feature limits', () => {
      const features = AI_FEATURE_POLICY.features;
      expect(features.quickLog.freeMonthlyLimit).toBe(15);
      expect(features.receiptScan.freeMonthlyLimit).toBe(3);
      expect(features.financialCoach.freeMonthlyLimit).toBe(3);
      expect(features.budgetForecast.freeMonthlyLimit).toBe(1);
      expect(features.savingsScenario.freeMonthlyLimit).toBe(2);
      expect(features.askPlete.freeMonthlyLimit).toBe(5);
      expect(features.monthlyReport.freeMonthlyLimit).toBe(1);
      expect(features.spendingInsights.freeMonthlyLimit).toBe(3);
    });
  });
});
