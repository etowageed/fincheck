const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

exports.createExpense = async (req, res) => {
  try {
    const newExpense = await Expense.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newExpense,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
    });
  }
};
