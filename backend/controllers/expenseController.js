const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

// Create or update monthly budget document
exports.upsertMonthlyExpense = async (req, res) => {
  try {
    const { month, year, income, fixedExpenses } = req.body;

    let expenseDoc = await Expense.findOneAndUpdate(
      { user: req.user.id, month, year },
      { income, fixedExpenses },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      status: 'success',
      data: expenseDoc,
    });
  } catch (err) {
    console.error('Error in upsertMonthlyExpense:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create or update expense data',
    });
  }
};

// Get full monthly expense
exports.getMonthlyExpense = async (req, res) => {
  try {
    const { month, year } = req.params;

    const expenseDoc = await Expense.findOne({
      user: req.user.id,
      month,
      year,
    });

    if (!expenseDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'No budget found for this month',
      });
    }

    res.status(200).json({
      status: 'success',
      data: expenseDoc,
    });
  } catch (err) {
    console.error('Error in getMonthlyExpense:', err);
    res.status(500).json({
      status: 'error',
      message: 'Could not retrieve budget data',
    });
  }
};

// Delete a monthly budget
exports.deleteMonthlyExpense = async (req, res) => {
  try {
    const { month, year } = req.params;
    const deleted = await Expense.findOneAndDelete({
      user: req.user.id,
      month,
      year,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ status: 'error', message: 'No budget to delete' });
    }

    res
      .status(200)
      .json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Error in deleteMonthlyExpense:', err);
    res
      .status(500)
      .json({ status: 'error', message: 'Failed to delete budget' });
  }
};

// add a transaction

exports.addTransaction = async (req, res) => {
  try {
    const { month, year } = req.params;
    const { description, amount, category, type } = req.body;

    let expenseDoc = await Expense.findOne({ user: req.user.id, month, year });

    // If no document exists, create one with default income = 0 and empty fixedExpenses
    if (!expenseDoc) {
      expenseDoc = await Expense.create({
        user: req.user.id,
        month,
        year,
        income: 0,
        fixedExpenses: [],
        transactions: [],
      });
    }

    // Push the new transaction
    expenseDoc.transactions.push({
      description,
      amount,
      category,
      type: type || 'actual',
    });

    await expenseDoc.save();

    res.status(201).json({
      status: 'success',
      data: expenseDoc,
    });
  } catch (err) {
    console.error('Error in addTransaction:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add transaction',
    });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { month, year, transactionId } = req.params;
    const { description, amount, category, type } = req.body;

    const expenseDoc = await Expense.findOne({
      user: req.user.id,
      month,
      year,
    });
    if (!expenseDoc) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Budget not found' });
    }

    const transaction = expenseDoc.transactions.id(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Transaction not found' });
    }

    if (description !== undefined) transaction.description = description;
    if (amount !== undefined) transaction.amount = amount;
    if (category !== undefined) transaction.category = category;
    if (type !== undefined) transaction.type = type;

    await expenseDoc.save();

    res.status(200).json({ status: 'success', data: expenseDoc });
  } catch (err) {
    console.error('Error in updateTransaction:', err);
    res
      .status(500)
      .json({ status: 'error', message: 'Failed to update transaction' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { month, year, transactionId } = req.params;

    const expenseDoc = await Expense.findOne({
      user: req.user.id,
      month,
      year,
    });
    if (!expenseDoc) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Budget not found' });
    }

    const index = expenseDoc.transactions.findIndex(
      (tx) => tx._id.toString() === transactionId
    );

    if (index === -1) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Transaction not found' });
    }

    expenseDoc.transactions.splice(index, 1); // ✅ remove transaction
    await expenseDoc.save();

    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted',
      data: expenseDoc,
    });
  } catch (err) {
    console.error('Error in deleteTransaction:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete transaction',
    });
  }
};
