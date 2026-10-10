import { defineStore } from 'pinia';
import * as aiService from '@/services/aiService';

export const useAiStore = defineStore('ai', {
  state: () => ({
    quotaData: null,
    isLoadingQuota: false,

    // Proposed transactions awaiting confirmation
    pendingProposals: [],
    showConfirmModal: false,
    confirmSource: 'quickLog', // 'quickLog' or 'receiptScan'

    // AI Features state
    chatHistory: [],
    insights: [],
    forecastData: null,
    reportData: null,
    scenarioResult: null,

    // Processing flags
    isProcessingQuickLog: false,
    isProcessingReceipt: false,
    isProcessingCoach: false,
    isProcessingAskPlete: false,
    isProcessingForecast: false,
    isProcessingScenario: false,
    isProcessingReport: false,
    isProcessingInsights: false,

    // Global quota exhausted modal trigger
    exhaustedFeatureKey: null,
    showUpgradePromptModal: false,
  }),

  getters: {
    isPremium: (state) => Boolean(state.quotaData?.isPremium),
    featuresQuota: (state) => state.quotaData?.features || {},
    getQuotaForKey: (state) => (key) => state.quotaData?.features?.[key] || null,
  },

  actions: {
    async fetchQuota() {
      this.isLoadingQuota = true;
      try {
        const data = await aiService.getQuotaStatus();
        this.quotaData = data;
      } catch (err) {
        console.error('Failed to load AI quota status:', err);
      } finally {
        this.isLoadingQuota = false;
      }
    },

    updateQuotaFromResponse(quota) {
      if (!quota || !this.quotaData) return;
      if (quota.featureKey && this.quotaData.features[quota.featureKey]) {
        this.quotaData.features[quota.featureKey] = {
          ...this.quotaData.features[quota.featureKey],
          usage: quota.usage,
          remaining: quota.remaining,
          allowed: quota.allowed,
        };
      }
    },

    handleQuotaExhaustedError(err, featureKey) {
      if (err.response?.status === 403 && err.response?.data?.code === 'QUOTA_EXHAUSTED') {
        this.openUpgradeModal(featureKey);
      }
    },

    openUpgradeModal(featureKey = null) {
      if (featureKey) {
        this.exhaustedFeatureKey = featureKey;
      }
      this.showUpgradePromptModal = true;
    },

    async submitQuickLog(text) {
      this.isProcessingQuickLog = true;
      try {
        const res = await aiService.quickLog(text);
        this.pendingProposals = res.proposals || [];
        this.confirmSource = 'quickLog';
        this.showConfirmModal = true;
        this.updateQuotaFromResponse(res.quota);
        return res.proposals;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'quickLog');
        throw err;
      } finally {
        this.isProcessingQuickLog = false;
      }
    },

    async submitReceiptScan(file) {
      this.isProcessingReceipt = true;
      try {
        const res = await aiService.receiptScan(file);
        if (res.proposal) {
          this.pendingProposals = [res.proposal];
        } else {
          this.pendingProposals = [];
        }
        this.confirmSource = 'receiptScan';
        this.showConfirmModal = true;
        this.updateQuotaFromResponse(res.quota);
        return res.proposal;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'receiptScan');
        throw err;
      } finally {
        this.isProcessingReceipt = false;
      }
    },

    async saveConfirmedTransactions(transactions) {
      const result = await aiService.confirmTransactions(transactions);
      this.pendingProposals = [];
      this.showConfirmModal = false;
      return result;
    },

    async askCoach(question) {
      this.isProcessingCoach = true;
      try {
        const res = await aiService.askCoach(question);
        this.updateQuotaFromResponse(res.quota);
        return res.advice;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'financialCoach');
        throw err;
      } finally {
        this.isProcessingCoach = false;
      }
    },

    async fetchForecast() {
      this.isProcessingForecast = true;
      try {
        const res = await aiService.getBudgetForecast();
        this.forecastData = res.forecast;
        this.updateQuotaFromResponse(res.quota);
        return res.forecast;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'budgetForecast');
        throw err;
      } finally {
        this.isProcessingForecast = false;
      }
    },

    async simulateScenario(scenario) {
      this.isProcessingScenario = true;
      try {
        const res = await aiService.simulateSavingsScenario(scenario);
        this.scenarioResult = res.simulation;
        this.updateQuotaFromResponse(res.quota);
        return res.simulation;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'savingsScenario');
        throw err;
      } finally {
        this.isProcessingScenario = false;
      }
    },

    async sendAskPleteMessage(messageText) {
      this.isProcessingAskPlete = true;
      this.chatHistory.push({ role: 'user', content: messageText });
      try {
        const res = await aiService.sendAskPlete(messageText, this.chatHistory);
        this.chatHistory.push({ role: 'assistant', content: res.reply });
        this.updateQuotaFromResponse(res.quota);
        return res.reply;
      } catch (err) {
        // Remove optimistic user message on failure
        this.chatHistory.pop();
        this.handleQuotaExhaustedError(err, 'askPlete');
        throw err;
      } finally {
        this.isProcessingAskPlete = false;
      }
    },

    async fetchMonthlyReport(month, year) {
      this.isProcessingReport = true;
      try {
        const res = await aiService.generateMonthlyReport(month, year);
        this.reportData = res.report;
        this.updateQuotaFromResponse(res.quota);
        return res.report;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'monthlyReport');
        throw err;
      } finally {
        this.isProcessingReport = false;
      }
    },

    async fetchSpendingInsights() {
      this.isProcessingInsights = true;
      try {
        const res = await aiService.getSpendingInsights();
        this.insights = res.insights || [];
        this.updateQuotaFromResponse(res.quota);
        return res.insights;
      } catch (err) {
        this.handleQuotaExhaustedError(err, 'spendingInsights');
        throw err;
      } finally {
        this.isProcessingInsights = false;
      }
    },
  },
});
