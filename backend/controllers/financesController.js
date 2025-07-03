// backend/controllers/financesController.js
const Finances = require('../models/financesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create or update monthly finances document (monthlyBudget and actuals)
exports.upsertMonthlyFinances = catchAsync(async (req, res, next) => {
  let { month, year, monthlyBudget } = req.body;
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

  const expenseDoc = await Finances.findOneAndUpdate(
    { user: req.user.id, month, year }, // Query based on user, calculated/provided month and year
    { monthlyBudget },
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

// Add a transaction to an existing monthly expense document
exports.addTransaction = catchAsync(async (req, res, next) => {
  const { month, year } = req.params; // Expect month and year from URL parameters
  const { description, amount, category, type } = req.body;

  const expenseDoc = await Finances.findOne({ user: req.user.id, month, year });

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
exports.deleteMonthlyExpense = catchAsync(async (req, res, next) => {
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
