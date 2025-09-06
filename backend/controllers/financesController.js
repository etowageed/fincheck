// backend/controllers/financesController.js
const Finances = require('../models/financesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { body, validationResult } = require('express-validator');

// Create or update monthly finances document (monthlyBudget and actuals)
exports.upsertMonthlyFinances = catchAsync(async (req, res, next) => {
  let { month, year, monthlyBudget, expectedMonthlyIncome } = req.body;

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

  const expenseDoc = await Finances.findOneAndUpdate(
    { user: req.user.id, month, year }, // Query based on user, calculated/provided month and year
    { monthlyBudget, expectedMonthlyIncome },
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

// Delete a monthly budget item from a monthly expense document
exports.deleteBudgetItem = catchAsync(async (req, res, next) => {
  const { month, year, budgetItemId } = req.params;

  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // Find the budget item by ID
  const budgetItem = expenseDoc.monthlyBudget.id(budgetItemId);
  if (!budgetItem) {
    return next(new AppError('Budget item not found.', 404));
  }

  // Remove the budget item by its ID
  expenseDoc.monthlyBudget.id(budgetItemId).deleteOne();

  await expenseDoc.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    message: 'Budget item deleted successfully',
    data: expenseDoc,
  });
});

// Get all monthly expense summaries for a user (e.g., for dashboard overview)
exports.getAllMonthlyExpenses = catchAsync(async (req, res, next) => {
  const expenses = await Finances.find({ user: req.user.id }).sort({
    year: -1,
    month: -1,
  });

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses,
  });
});

// Validation middleware for adding a transaction
exports.validateTransaction = [
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .escape(),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .escape(),
  body('type')
    .optional()
    .isIn(['expense', 'excludedExpense', 'income'])
    .withMessage('Type must be expense, excludedExpense, or income'),
];

// Add a transaction to an existing monthly expense document
exports.addTransaction = catchAsync(async (req, res, next) => {
  // Check validation result
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors
          .array()
          .map((e) => e.msg)
          .join(', '),
        400
      )
    );
  }

  const { month, year } = req.params; // Expect month and year from URL parameters
  const { description, amount, category, type } = req.body;

  let expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

  // If no document exists, create a new one with an empty monthlyBudget
  if (!expenseDoc) {
    expenseDoc = new Finances({
      user: req.user.id,
      month,
      year,
      monthlyBudget: [
        {
          category: category || 'Uncategorized',
          amount: amount,
          isRecurring: false,
        },
      ],
      transactions: [],
    });
  }

  // Add the new transaction to the transactions array
  expenseDoc.transactions.push({
    description,
    amount,
    category,
    type: type || 'actual',
  });

  await expenseDoc.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});

// Update an existing transaction within a monthly expense document
// Update an existing transaction within a monthly expense document
exports.updateTransaction = catchAsync(async (req, res, next) => {
  const { month, year, transactionId } = req.params;

  // 1. Construct an update object containing ONLY the provided fields from req.body
  const updateFields = {};
  if (req.body.description !== undefined) {
    updateFields.description = req.body.description;
  }
  if (req.body.amount !== undefined) {
    updateFields.amount = req.body.amount;
  }
  if (req.body.category !== undefined) {
    // Assuming category might also be updated partially
    updateFields.category = req.body.category;
  }
  if (req.body.type !== undefined) {
    // Assuming type might also be updated partially
    updateFields.type = req.body.type;
  }
  // You can add other fields here if your transactionSchema had more updateable fields

  // Check if any fields were actually provided for update
  if (Object.keys(updateFields).length === 0) {
    return next(new AppError('No valid fields provided for update.', 400));
  }

  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // Find the transaction by ID
  const transaction = expenseDoc.transactions.id(transactionId);
  if (!transaction) {
    return next(new AppError('Transaction not found.', 404));
  }

  // Apply only the provided fields to the transaction subdocument
  // Mongoose will update only these fields, and 'required' validators
  // for fields NOT in updateFields will not be triggered
  // as long as they already have valid values in the document.
  transaction.set(updateFields);

  // Save the parent document, which also triggers subdocument validations for modified fields
  await expenseDoc.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    data: expenseDoc,
  });
});

// Delete a transaction from a monthly expense document
exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const { month, year, transactionId } = req.params;

  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

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
// Delete a monthly expense document
exports.deleteMonthlyFinances = catchAsync(async (req, res, next) => {
  const { month, year } = req.params;

  // Find the document and then delete it
  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

  // IMPORTANT: Check if the document was found
  if (!expenseDoc) {
    return next(
      new AppError('No expense document found for this month and year.', 404)
    );
  }

  // If the document exists, proceed to delete it
  await expenseDoc.deleteOne(); // This line should now only execute if expenseDoc is not null

  res.status(204).json({
    status: 'success',
    data: null, // 204 No Content typically returns null data
  });
});

// Get expenses for a specific month and year
exports.getMonthlyExpense = catchAsync(async (req, res, next) => {
  const { month, year } = req.params;

  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

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

// Compare current and previous periods (month or year) for financial metrics
// TODO add support for comparing custom periods
exports.comparePeriods = catchAsync(async (req, res, next) => {
  const { periodType } = req.query; // 'month' or 'year'
  const now = new Date();
  const userId = req.user.id;

  let currentFilter = {},
    previousFilter = {};

  if (periodType === 'month') {
    const month = now.getMonth();
    const year = now.getFullYear();
    currentFilter = { user: userId, month, year };
    previousFilter =
      month === 0
        ? { user: userId, month: 11, year: year - 1 }
        : { user: userId, month: month - 1, year };
  } else if (periodType === 'year') {
    const year = now.getFullYear();
    currentFilter = { user: userId, year };
    previousFilter = { user: userId, year: year - 1 };
  } else {
    return next(
      new AppError('Only "month" or "year" periodType is supported', 400)
    );
  }

  const [currentDoc, previousDoc] = await Promise.all([
    Finances.findOne(currentFilter),
    Finances.findOne(previousFilter),
  ]);

  if (!currentDoc || !previousDoc) {
    return res.status(404).json({
      status: 'fail',
      message: 'Not enough data to compare the requested periods.',
      missing: {
        current: !currentDoc,
        previous: !previousDoc,
      },
    });
  }

  const compareFields = [
    'incomeTotal',
    'expensesTotal',
    'excludedExpensesTotal',
    'safeToSpend',
    'totalMonthlyBudget',
    'outflow',
  ];

  const comparison = compareFields.reduce((result, field) => {
    const current = currentDoc[field];
    const previous = previousDoc[field];
    const difference = current - previous;

    let percentChange = null;
    let direction = null;

    if (previous !== 0) {
      percentChange = (difference / previous) * 100;
      percentChange = Math.round(percentChange * 100) / 100; // Round to 2 decimals

      if (percentChange > 0) direction = 'increase';
      else if (percentChange < 0) direction = 'decrease';
      else direction = 'same';
    }

    result[field] = {
      current,
      previous,
      difference,
      percentChange,
      direction, // useful for frontend to decide icon (e.g., ↑ ↓ ↔)
      displayValue:
        percentChange !== null
          ? `${percentChange > 0 ? '+' : ''}${percentChange}%`
          : 'N/A',
    };

    return result;
  }, {});

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentPeriodLabel =
    periodType === 'month'
      ? `${monthNames[currentDoc.month]} ${currentDoc.year}`
      : `${currentDoc.year}`;

  const previousPeriodLabel =
    periodType === 'month'
      ? `${monthNames[previousDoc.month]} ${previousDoc.year}`
      : `${previousDoc.year}`;

  res.status(200).json({
    status: 'success',
    periodType,
    currentPeriod: currentPeriodLabel,
    previousPeriod: previousPeriodLabel,
    comparison,
  });
});
