// backend/controllers/financesController.js
const Finances = require('../models/financesModel');
const Category = require('../models/categoryModel');
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
  const { description, amount, category, type, date } = req.body;

  let expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

  // If no document exists, return an error.
  if (!expenseDoc) {
    return next(
      new AppError(
        'No budget document found for this month. Please create a budget first.',
        404
      )
    );
  }

  // Add the new transaction to the transactions array
  expenseDoc.transactions.push({
    description,
    amount,
    category,
    type: type || 'expense', // Changed from 'actual' to 'expense' to match schema
    date: req.body.date ? new Date(req.body.date) : Date.now(),
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
  if (req.body.date !== undefined) {
    // Assuming date might also be updated partially
    updateFields.date = req.body.date ? new Date(req.body.date) : Date.now();
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

exports.getMonthlyTrends = catchAsync(async (req, res, next) => {
  // 1. Define the date range for the trend data (e.g., last 12 months)
  const toDate = new Date();

  let fromDate = new Date();
  let days;

  if (req.query.period === 'currentMonth') {
    fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    days = toDate.getDate(); // Number of days so far in the month
  } else {
    days = parseInt(req.query.days, 10) || 365;
    fromDate.setDate(toDate.getDate() - days);
  }

  // Determine granularity based on the requested period
  const isDaily = days <= 90;
  const groupBy = isDaily
    ? {
        year: { $year: '$transactions.date' },
        month: { $month: '$transactions.date' },
        day: { $dayOfMonth: '$transactions.date' },
      }
    : {
        year: { $year: '$transactions.date' },
        month: { $month: '$transactions.date' },
      };

  const sortBy = isDaily
    ? { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    : { '_id.year': 1, '_id.month': 1 };

  const monthlyTrends = await Finances.aggregate([
    // 2. Match documents for the logged-in user within the date range
    {
      $match: {
        user: req.user._id,
        createdAt: { $gte: fromDate, $lte: toDate },
      },
    },
    // 3. Deconstruct the transactions array to process each transaction
    {
      $unwind: '$transactions',
    },
    // 4. Group transactions by year and month, calculating totals
    {
      $group: {
        _id: groupBy,
        totalIncome: {
          $sum: {
            $cond: [
              { $eq: ['$transactions.type', 'income'] },
              '$transactions.amount',
              0,
            ],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ['$transactions.type', 'expense'] },
              '$transactions.amount',
              0,
            ],
          },
        },
      },
    },
    // 5. Add a field for net savings
    {
      $addFields: {
        netSavings: { $subtract: ['$totalIncome', '$totalExpenses'] },
      },
    },
    // 6. Sort the results chronologically
    {
      $sort: sortBy,
    },
    // 7. Project for a cleaner output format
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        day: '$_id.day', // will be null if grouped by month
        totalIncome: 1,
        totalExpenses: 1,
        netSavings: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: monthlyTrends.length,
    granularity: isDaily ? 'daily' : 'monthly',
    data: monthlyTrends,
  });
});

// A new temporary function to seed data for testing
exports.seedData = catchAsync(async (req, res, next) => {
  // 1. Clean up any existing data for this user to prevent duplicates
  await Finances.deleteMany({ user: req.user.id });

  // 2. Fetch some default categories to use for transactions
  const categories = await Category.find({ isGlobalDefault: true });
  const expenseCategories = categories.filter(
    (c) =>
      ![
        'Salary',
        'Freelance',
        'Business Income',
        'Investment Returns',
        'Other Income',
      ].includes(c.name)
  );
  const incomeCategories = categories.filter((c) =>
    ['Salary', 'Other Income'].includes(c.name)
  );

  if (expenseCategories.length === 0 || incomeCategories.length === 0) {
    return next(
      new AppError('Please create global default categories first.', 400)
    );
  }

  // 3. Loop for the last 12 months to create historical data
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const transactions = [];
    const numTransactions = Math.floor(Math.random() * 15) + 10; // 10 to 25 transactions per month

    // Add one main income transaction
    transactions.push({
      description: 'Monthly Paycheck',
      amount: Math.floor(Math.random() * 1000) + 4000, // 4000 - 5000
      category: incomeCategories[0]._id,
      type: 'income',
      date: new Date(year, month, 1),
    });

    // Add random expense transactions
    for (let j = 0; j < numTransactions; j++) {
      const randomCategory =
        expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      transactions.push({
        description: `Random expense for ${randomCategory.name}`,
        amount: Math.floor(Math.random() * 150) + 5, // 5 - 155
        category: randomCategory._id,
        type: 'expense',
        date: new Date(year, month, Math.floor(Math.random() * 28) + 1),
      });
    }

    // 4. Create the Finances document for the month
    await Finances.create({
      user: req.user.id,
      month,
      year,
      expectedMonthlyIncome: 4500,
      monthlyBudget: [], // Keeping this simple for now
      transactions,
    });
  }

  res.status(201).json({
    status: 'success',
    message: '12 months of sample data have been generated successfully.',
  });
});

// Get a breakdown of expenses by category over a specified period
exports.getCategoryBreakdown = catchAsync(async (req, res, next) => {
  // 1. Define the date range. Default to the last 90 days.
  const periodInDays = req.query.days || 90;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - periodInDays);

  const categoryData = await Finances.aggregate([
    // 2. Match documents for the logged-in user
    {
      $match: {
        user: req.user._id,
      },
    },
    // 3. Deconstruct the transactions array to process each transaction
    {
      $unwind: '$transactions',
    },
    // 4. Filter for only 'expense' type transactions within the date range
    {
      $match: {
        'transactions.type': 'expense',
        'transactions.date': { $gte: fromDate },
      },
    },
    // 5. Group by the category ID string
    {
      $group: {
        _id: '$transactions.category',
        totalSpent: { $sum: '$transactions.amount' },
        count: { $sum: 1 },
      },
    },
    //
    // --- FIX: Convert the string ID to an ObjectId before the lookup ---
    //
    {
      $addFields: {
        convertedCategoryId: { $toObjectId: '$_id' },
      },
    },
    // 6. Look up category names from the Categories collection
    {
      $lookup: {
        from: 'categories',
        localField: 'convertedCategoryId', // Use the newly converted ObjectId field
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    // 7. Deconstruct the categoryInfo array
    {
      $unwind: {
        path: '$categoryInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    // 8. Sort by the total amount spent in descending order
    {
      $sort: {
        totalSpent: -1,
      },
    },
    // 9. Project for a cleaner output format
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryName: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
        totalSpent: '$totalSpent',
        transactionCount: '$count',
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: categoryData.length,
    data: categoryData,
  });
});

// Get a user's largest expense transactions over a specified period
exports.getTopTransactions = catchAsync(async (req, res, next) => {
  // 1. Define query parameters
  const limit = parseInt(req.query.limit, 3) || 3;
  const days = parseInt(req.query.days, 3) || 365; // Default to the last year
  const transactionType = req.query.type || 'expense'; // New: Default to 'expense'

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const topTransactions = await Finances.aggregate([
    // 2. Match documents for the logged-in user
    {
      $match: {
        user: req.user._id,
      },
    },
    // 3. Deconstruct the transactions array
    {
      $unwind: '$transactions',
    },
    // 4. Filter for only 'expense' type transactions within the date range
    {
      $match: {
        'transactions.type': transactionType,
        'transactions.date': { $gte: fromDate },
      },
    },
    // 5. Sort all transactions by amount, descending
    {
      $sort: {
        'transactions.amount': -1,
      },
    },
    // 6. Limit to the top N results
    {
      $limit: limit,
    },
    // 7. Convert string category ID to ObjectId for lookup
    {
      $addFields: {
        'transactions.convertedCategoryId': {
          $toObjectId: '$transactions.category',
        },
      },
    },
    // 8. Look up category names for better display
    {
      $lookup: {
        from: 'categories',
        localField: 'transactions.convertedCategoryId',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    // 9. Project for a final, clean output
    {
      $project: {
        _id: '$transactions._id',
        description: '$transactions.description',
        amount: '$transactions.amount',
        date: '$transactions.date',
        categoryName: {
          $ifNull: [
            { $arrayElemAt: ['$categoryInfo.name', 0] },
            'Uncategorized',
          ],
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: topTransactions.length,
    data: topTransactions,
  });
});

// Get all transactions for a user within a specified date range
exports.getAllTransactionsReport = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days, 10) || 30; // Default to 30 days
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  // NEW: Get optional category filter
  const categoryId = req.query.category;

  // Build the initial pipeline stages
  const pipeline = [
    { $match: { user: req.user._id } },
    { $unwind: '$transactions' },
    { $match: { 'transactions.date': { $gte: fromDate } } },
    // 1. Add sort stage before the final projection
    { $sort: { 'transactions.date': -1 } },
  ];

  // 2. Add category filter if provided
  if (categoryId) {
    pipeline.push({
      $match: { 'transactions.category': categoryId },
    });
  }

  // 3. Add the root replacement stage last
  pipeline.push({ $replaceRoot: { newRoot: '$transactions' } });

  const transactions = await Finances.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions,
  });
});

exports.getDashboardMetrics = catchAsync(async (req, res, next) => {
  // We will enhance this with date ranges later, for now, it gets the current month.
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const finances = await Finances.findOne({ user: req.user.id, month, year });

  // If a finances document exists, populate all metrics from its virtual properties.
  const metrics = finances
    ? {
        incomeTotal: finances.incomeTotal,
        expensesTotal: finances.expensesTotal,
        excludedExpensesTotal: finances.excludedExpensesTotal,
        outflow: finances.outflow,
        safeToSpend: finances.safeToSpend,
        totalMonthlyBudget: finances.totalMonthlyBudget,
        totalRecurringExpenses: finances.totalRecurringExpenses,
        totalNonRecurringExpenses: finances.totalNonRecurringExpenses,
        plannedSavings: finances.plannedSavings,
      }
    : // If no document exists, return a default object with all metrics set to 0.
      {
        incomeTotal: 0,
        expensesTotal: 0,
        excludedExpensesTotal: 0,
        outflow: 0,
        safeToSpend: 0,
        totalMonthlyBudget: 0,
        totalRecurringExpenses: 0,
        totalNonRecurringExpenses: 0,
        plannedSavings: 0,
      };

  res.status(200).json({
    status: 'success',
    data: {
      metrics,
    },
  });
});
