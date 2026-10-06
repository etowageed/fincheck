/**
 * Central Feature Entitlements & AI Configuration
 */

const AI_FEATURE_POLICY = {
  features: {
    quickLog: {
      key: 'quickLog',
      name: 'Quick-Log Expense',
      freeMonthlyLimit: 15,
      description: 'Log expenses using natural language text.',
    },
    receiptScan: {
      key: 'receiptScan',
      name: 'Receipt & Note Scanner',
      freeMonthlyLimit: 3,
      description: 'Scan physical receipts or handwritten financial notes.',
    },
    financialCoach: {
      key: 'financialCoach',
      name: 'AI Financial Coach',
      freeMonthlyLimit: 3,
      description: 'Personalized financial advice based on your spending history.',
    },
    budgetForecast: {
      key: 'budgetForecast',
      name: 'Budget Forecast',
      freeMonthlyLimit: 1,
      description: 'Predictive spending trends and end-of-month budget projections.',
    },
    savingsScenario: {
      key: 'savingsScenario',
      name: 'Savings Scenario Simulator',
      freeMonthlyLimit: 2,
      description: 'What-if scenarios for spending cuts and goal targets.',
    },
    askPlete: {
      key: 'askPlete',
      name: 'Ask Plete Assistant',
      freeMonthlyLimit: 5,
      description: 'Conversational assistant for your personal finances.',
    },
    monthlyReport: {
      key: 'monthlyReport',
      name: 'AI Monthly Report',
      freeMonthlyLimit: 1,
      description: 'Comprehensive AI summary report of monthly performance.',
    },
    spendingInsights: {
      key: 'spendingInsights',
      name: 'Spending Insights',
      freeMonthlyLimit: 3,
      description: 'Automated anomaly detection and spending trend insights.',
    },
  },

  // Gemini API Configuration
  gemini: {
    defaultModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    fallbackModels: ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'],
    timeoutMs: 20000,
    maxRetries: 2,
  },

  // Upload constraints
  receiptScanLimits: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/gif'],
  },
};

module.exports = AI_FEATURE_POLICY;
