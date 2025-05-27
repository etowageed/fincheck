const express = require('express');
const expenseController = require('../controllers/expenseController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect); // protects all routes below

router.post('/', expenseController.upsertMonthlyExpense); // creates or updates monthly expense

router
  .route('/:month/:year/transactions') // TODO: make it that the route parameters are automatically added without manually entering them
  .post(expenseController.addTransaction);

router
  .route('/:month/:year')
  .get(expenseController.getMonthlyExpense)
  .delete(expenseController.deleteMonthlyExpense);

router
  .route('/:month/:year/transactions/:transactionId')
  .patch(expenseController.updateTransaction)
  .delete(expenseController.deleteTransaction);

module.exports = router;
