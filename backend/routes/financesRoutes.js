const express = require('express');
const financesController = require('../controllers/financesController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect); // protects all routes below

router
  .post('/', financesController.upsertMonthlyFinances)
  .get('/', financesController.getAllMonthlyExpenses); // creates or updates monthly expense

router.post(
  '/:month/:year/transactions',
  financesController.validateTransaction,
  financesController.addTransaction
);

router
  .route('/:month/:year')
  .get(financesController.getMonthlyExpense)
  .delete(financesController.deleteMonthlyFinances);

// Add this new route for deleting monthly budget items
router
  .route('/:month/:year/budget/:budgetItemId')
  .delete(financesController.deleteBudgetItem);

router
  .route('/:month/:year/transactions/:transactionId')
  .patch(financesController.updateTransaction)
  .delete(financesController.deleteTransaction);

router.get('/compare', financesController.comparePeriods);

module.exports = router;
