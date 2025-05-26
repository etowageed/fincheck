const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

// Create or update monthly expense document
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
