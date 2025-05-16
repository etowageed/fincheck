const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');

const expenseSchema = new mongoose.Schema({
  name: String, // e.g. rent
  amount: Number,
  category: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'You must be a user to add an expense'],
  },
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
