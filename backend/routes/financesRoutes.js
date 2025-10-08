const express = require('express');
const financesController = require('../controllers/financesController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect); // protects all routes below

// --- GENERAL & REPORTING ROUTES (specific) ---
// These should come BEFORE routes with parameters.
router.get('/trends', financesController.getMonthlyTrends);
router.get('/compare', financesController.comparePeriods);
router.post('/seed-data', financesController.seedData);
router.get(
  '/reports/category-breakdown',
  financesController.getCategoryBreakdown
);
router.get('/reports/top-transactions', financesController.getTopTransactions);
// New route for fetching all transactions in a date range
router.get(
  '/reports/all-transactions',
  financesController.getAllTransactionsReport
);

// --- DOCUMENT-LEVEL ROUTES (less specific) ---
router
  .route('/')
  .post(financesController.upsertMonthlyFinances)
  .get(financesController.getAllMonthlyExpenses);

router
  .route('/:month/:year')
  .get(financesController.getMonthlyExpense)
  .delete(financesController.deleteMonthlyFinances);

// --- SUB-DOCUMENT ROUTES (most specific parameter routes) ---
router.post(
  '/:month/:year/transactions',
  financesController.validateTransaction,
  financesController.addTransaction
);

router
  .route('/:month/:year/budget/:budgetItemId')
  .delete(financesController.deleteBudgetItem);

router
  .route('/:month/:year/transactions/:transactionId')
  .patch(financesController.updateTransaction)
  .delete(financesController.deleteTransaction);

module.exports = router;
