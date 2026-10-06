import api from './api';

export const getQuotaStatus = async () => {
  const response = await api.get('/ai/quota');
  return response.data.data;
};

export const quickLog = async (text) => {
  const response = await api.post('/ai/quick-log', { text });
  return response.data.data;
};

export const receiptScan = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/ai/receipt-scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const confirmTransactions = async (transactions) => {
  const response = await api.post('/ai/confirm-transactions', { transactions });
  return response.data;
};

export const askCoach = async (question) => {
  const response = await api.post('/ai/coach', { question });
  return response.data.data;
};

export const getBudgetForecast = async () => {
  const response = await api.post('/ai/budget-forecast', {});
  return response.data.data;
};

export const simulateSavingsScenario = async (scenario) => {
  const response = await api.post('/ai/savings-scenario', { scenario });
  return response.data.data;
};

export const sendAskPlete = async (message, history = []) => {
  const response = await api.post('/ai/ask-plete', { message, history });
  return response.data.data;
};

export const generateMonthlyReport = async (month, year) => {
  const response = await api.post('/ai/monthly-report', { month, year });
  return response.data.data;
};

export const getSpendingInsights = async () => {
  const response = await api.post('/ai/spending-insights', {});
  return response.data.data;
};
