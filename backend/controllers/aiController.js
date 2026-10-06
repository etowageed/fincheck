const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const quotaService = require('../services/quotaService');
const aiService = require('../services/aiService');
const categoryGroundingService = require('../services/categoryGroundingService');
const Finances = require('../models/financesModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');

/**
 * Helper to build deterministic financial summary object for the current user
 */
const buildUserFinancialSummary = async (userId, targetMonth = null, targetYear = null) => {
  const now = new Date();
  const month = targetMonth !== null ? Number(targetMonth) : now.getMonth();
  const year = targetYear !== null ? Number(targetYear) : now.getFullYear();

  let currentFinances = await Finances.findOne({ user: userId, month, year });
  const userObj = await User.findById(userId).select('preferredCurrency goals');

  if (!currentFinances) {
    currentFinances = {
      month,
      year,
      expectedMonthlyIncome: 0,
      monthlyBudget: [],
      transactions: [],
      totalMonthlyBudget: 0,
      totalRecurringExpenses: 0,
      expensesTotal: 0,
      incomeTotal: 0,
      savingsTotal: 0,
      outflow: 0,
      budgetBalance: 0,
      plannedSavings: 0,
    };
  }

  // Load user categories to resolve any ObjectId string to Category Name
  const userCategories = await Category.getCategoriesForUser(userId);
  const categoryIdToNameMap = {};
  userCategories.forEach((cat) => {
    categoryIdToNameMap[cat._id.toString()] = cat.name;
    categoryIdToNameMap[cat.name] = cat.name;
  });

  // Calculate category breakdown with resolved category names
  const categoryTotals = {};
  if (currentFinances.transactions && currentFinances.transactions.length > 0) {
    currentFinances.transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const rawCat = tx.category || 'Uncategorised';
        const resolvedCategoryName = categoryIdToNameMap[rawCat] || rawCat;
        categoryTotals[resolvedCategoryName] = (categoryTotals[resolvedCategoryName] || 0) + tx.amount;
      }
    });
  }

  const categoryBreakdown = Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total: Math.round(total * 100) / 100,
  })).sort((a, b) => b.total - a.total);

  return {
    currency: userObj?.preferredCurrency || 'USD',
    period: `${year}-${String(month + 1).padStart(2, '0')}`,
    expectedMonthlyIncome: currentFinances.expectedMonthlyIncome || 0,
    totalMonthlyBudget: currentFinances.totalMonthlyBudget || 0,
    totalRecurringExpenses: currentFinances.totalRecurringExpenses || 0,
    actualExpensesTotal: currentFinances.expensesTotal || 0,
    actualIncomeTotal: currentFinances.incomeTotal || 0,
    actualSavingsTotal: currentFinances.savingsTotal || 0,
    budgetBalance: currentFinances.budgetBalance || 0,
    plannedSavings: currentFinances.plannedSavings || 0,
    topExpenseCategories: categoryBreakdown.slice(0, 5),
    goals: (userObj?.goals || []).map((g) => ({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
    })),
    recentTransactionsCount: currentFinances.transactions ? currentFinances.transactions.length : 0,
  };
};

/**
 * GET /api/v1/ai/quota
 */
exports.getQuotaStatus = catchAsync(async (req, res, next) => {
  const status = await quotaService.getUserQuotaStatus(req.user);
  res.status(200).json({
    status: 'success',
    data: status,
  });
});

/**
 * POST /api/v1/ai/quick-log
 */
exports.quickLog = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return next(new AppError('Please provide expense text to log.', 400));
  }

  // 1. Check and consume quota
  const quotaResult = await quotaService.consumeQuota(req.user._id, 'quickLog', req.user);

  // 2. Fetch categories for grounding
  const userCategories = await categoryGroundingService.getFormattedUserCategories(req.user._id);

  // 3. Call AI
  const referenceDate = new Date().toISOString().split('T')[0];
  const rawProposals = await aiService.parseQuickLogText(text.trim(), userCategories, referenceDate);

  // 4. Ground categories against DB
  const groundedProposals = await categoryGroundingService.groundTransactionProposals(req.user._id, rawProposals);

  res.status(200).json({
    status: 'success',
    data: {
      proposals: groundedProposals,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/receipt-scan
 */
exports.receiptScan = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a receipt or note image file.', 400));
  }

  // 1. Check and consume quota
  const quotaResult = await quotaService.consumeQuota(req.user._id, 'receiptScan', req.user);

  // 2. Fetch categories
  const userCategories = await categoryGroundingService.getFormattedUserCategories(req.user._id);

  // 3. Call AI Vision
  const referenceDate = new Date().toISOString().split('T')[0];
  const extractionResult = await aiService.parseReceiptImage(
    req.file.buffer,
    req.file.mimetype,
    userCategories,
    referenceDate
  );

  // 4. Ground extracted category
  const groundedCategory = categoryGroundingService.matchCategory(
    extractionResult.category,
    await Category.getCategoriesForUser(req.user._id)
  );

  const proposal = {
    merchant: extractionResult.merchant || 'Unknown Merchant',
    description: extractionResult.merchant ? `Receipt from ${extractionResult.merchant}` : 'Scanned Receipt',
    amount: extractionResult.totalAmount || 0,
    currency: extractionResult.currency || req.user.preferredCurrency || 'USD',
    category: groundedCategory.categoryName,
    categoryGrounded: groundedCategory.isGrounded,
    date: extractionResult.date || referenceDate,
    type: 'expense',
    isLowConfidence: Boolean(extractionResult.isLowConfidence),
    lineItems: extractionResult.lineItems || [],
  };

  res.status(200).json({
    status: 'success',
    data: {
      proposal,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/confirm-transactions
 */
exports.confirmTransactions = catchAsync(async (req, res, next) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return next(new AppError('No transactions provided for confirmation.', 400));
  }

  const userId = req.user._id;
  const savedTransactions = [];

  for (const item of transactions) {
    if (!item.amount || item.amount <= 0 || !item.description) {
      continue;
    }

    const txDate = item.date ? new Date(item.date) : new Date();
    const month = txDate.getMonth();
    const year = txDate.getFullYear();

    let financesDoc = await Finances.findOne({ user: userId, month, year });
    if (!financesDoc) {
      financesDoc = await Finances.create({
        user: userId,
        month,
        year,
        monthlyBudget: [],
        transactions: [],
      });
    }

    const newTx = {
      description: item.description.trim(),
      amount: Number(item.amount),
      category: item.category || 'Uncategorised',
      type: item.type && ['expense', 'income', 'savings'].includes(item.type) ? item.type : 'expense',
      date: txDate,
      notes: item.notes || (item.merchant ? `Merchant: ${item.merchant}` : ''),
    };

    financesDoc.transactions.push(newTx);
    await financesDoc.save();

    const createdTx = financesDoc.transactions[financesDoc.transactions.length - 1];
    savedTransactions.push(createdTx);
  }

  res.status(201).json({
    status: 'success',
    message: `Successfully saved ${savedTransactions.length} transaction(s).`,
    data: {
      transactions: savedTransactions,
    },
  });
});

/**
 * POST /api/v1/ai/coach
 */
exports.financialCoach = catchAsync(async (req, res, next) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return next(new AppError('Please provide a financial question for the Coach.', 400));
  }

  const quotaResult = await quotaService.consumeQuota(req.user._id, 'financialCoach', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id);

  const adviceText = await aiService.generateFinancialAdvice(question.trim(), financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      advice: adviceText,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/budget-forecast
 */
exports.budgetForecast = catchAsync(async (req, res, next) => {
  const quotaResult = await quotaService.consumeQuota(req.user._id, 'budgetForecast', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id);

  const forecastText = await aiService.generateBudgetForecast(financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      forecast: forecastText,
      summaryMetrics: financialSummary,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/savings-scenario
 */
exports.savingsScenario = catchAsync(async (req, res, next) => {
  const { scenario } = req.body;
  if (!scenario || typeof scenario !== 'string') {
    return next(new AppError('Please describe the scenario you want to simulate.', 400));
  }

  const quotaResult = await quotaService.consumeQuota(req.user._id, 'savingsScenario', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id);

  const simulationResult = await aiService.simulateSavingsScenario(scenario.trim(), financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      simulation: simulationResult,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/ask-plete
 */
exports.askPlete = catchAsync(async (req, res, next) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return next(new AppError('Please provide a message for Ask Plete.', 400));
  }

  const quotaResult = await quotaService.consumeQuota(req.user._id, 'askPlete', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id);

  const assistantReply = await aiService.askPleteChat(message.trim(), history || [], financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      reply: assistantReply,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/monthly-report
 */
exports.monthlyReport = catchAsync(async (req, res, next) => {
  const now = new Date();
  const month = req.body.month !== undefined ? Number(req.body.month) : now.getMonth();
  const year = req.body.year !== undefined ? Number(req.body.year) : now.getFullYear();

  const quotaResult = await quotaService.consumeQuota(req.user._id, 'monthlyReport', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id, month, year);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[month] || 'Current Month';

  const reportMarkdown = await aiService.generateMonthlyReport(monthName, year, financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      month: monthName,
      year,
      report: reportMarkdown,
      summaryMetrics: financialSummary,
      quota: quotaResult,
    },
  });
});

/**
 * POST /api/v1/ai/spending-insights
 */
exports.spendingInsights = catchAsync(async (req, res, next) => {
  const quotaResult = await quotaService.consumeQuota(req.user._id, 'spendingInsights', req.user);
  const financialSummary = await buildUserFinancialSummary(req.user._id);

  const insightsList = await aiService.generateSpendingInsights(financialSummary);

  res.status(200).json({
    status: 'success',
    data: {
      insights: insightsList,
      quota: quotaResult,
    },
  });
});
