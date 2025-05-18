const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

exports.createExpense = async (req, res) => {
  try {
    const { name, amount, category, frequency } = req.body;

    const userId = req.user.id; // from auth

    // creating the expense
    const newExpense = new Expense({
      user: userId,
      name,
      amount,
      category,
      frequency: frequency || 'monthly',
    });

    const savedExpense = await newExpense.save();

    // adding expense reference to user document
    await User.findByIdAndUpdate(userId, {
      $push: { expenses: savedExpense._id },
    });

    res.status(201).json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Could not create expense... make sure you are logged in',
    });
  }
};
