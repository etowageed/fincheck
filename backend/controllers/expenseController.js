// backend/controllers/expenseController.js
const Expense = require('../models/expenseModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create or update monthly expense document (monthlyBudget and actuals)
exports.upsertMonthlyExpense = catchAsync(async (req, res, next) => {
  let { month, year, income, monthlyBudget } = req.body;
  // Use 'let' as we might reassign month/year

  // If month or year are not provided in the request body,
  // automatically set them to the current month and year.
  // This ensures the findOneAndUpdate query correctly targets the current month's document.
  const currentDate = new Date();
  if (month === undefined || month === null) {
    month = currentDate.getMonth(); // Mongoose default for month is 0-indexed (Jan=0, Dec=11)
  }
  if (year === undefined || year === null) {
    year = currentDate.getFullYear();
  }

  const expenseDoc = await Expense.findOneAndUpdate(
    { user: req.user.id, month, year }, // Query based on user, calculated/provided month and year
    { income, monthlyBudget }, // Data to update/set (income and monthlyBudget array)
    {
      upsert: true, // Create the document if it doesn't exist
      new: true, // Return the updated/new document
      setDefaultsOnInsert: true, // Apply schema defaults for new documents (e.g., timestamps)
      runValidators: true, // Run schema validators on the update operation
    }
  );

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});

// Get all monthly expense summaries for a user (e.g., for dashboard overview)
exports.getAllMonthlyExpenses = catchAsync(async (req, res, next) => {
  const expenses = await Expense.find({ user: req.user.id }).sort({
    year: -1,
    month: -1,
  });

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses,
  });
});

// Add a transaction to an existing monthly expense document
exports.addTransaction = catchAsync(async (req, res, next) => {
  const { month, year } = req.params; // Expect month and year from URL parameters
  const { description, amount, category, type } = req.body;

  const expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // Add the new transaction to the transactions array
  expenseDoc.transactions.push({
    description,
    amount,
    category,
    type: type || 'actual', // Default to 'actual' if type is not provided
  });

  await expenseDoc.save({ validateBeforeSave: true }); // Save and run validators

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});

// Update an existing transaction within a monthly expense document
exports.updateTransaction = catchAsync(async (req, res, next) => {
  const { month, year, transactionId } = req.params;
  const { description, amount, category, type } = req.body;

  const expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // Find the transaction by ID and update its fields
  const transaction = expenseDoc.transactions.id(transactionId);
  if (!transaction) {
    return next(new AppError('Transaction not found.', 404));
  }

  transaction.set({ description, amount, category, type }); // Update using .set()

  await expenseDoc.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});

// Delete a transaction from a monthly expense document
exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const { month, year, transactionId } = req.params;

  const expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // Remove the transaction by its ID
  expenseDoc.transactions.id(transactionId).deleteOne(); // Use deleteOne() to remove subdocument

  await expenseDoc.save({ validateBeforeSave: true });

  res.status(204).json({
    status: 'success',
    data: null, // No content for 204
  });
});

// Delete a monthlyBudget item from a monthly expense document
exports.deleteMonthlyExpense = catchAsync(async (req, res, next) => {
  const { month, year, monthlyBudgetId } = req.params;

  const expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  expenseDoc.monthlyBudget.id(monthlyBudgetId).deleteOne(); // Use deleteOne() to remove subdocument

  await expenseDoc.save({ validateBeforeSave: true });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get expenses for a specific month and year
exports.getMonthlyExpense = catchAsync(async (req, res, next) => {
  const { month, year } = req.params;

  const expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});
