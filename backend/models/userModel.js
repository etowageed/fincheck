const mongoose = require('mongoose');
const validator = require('validator');
const Expense = require('./expenseModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  password: {
    type: String, // must be hashed
    required: [true, 'Please provide a password'],
    minLength: [8, 'Password must have atleast 8 characters'],
    select: false,
  },

  income: {
    type: Number,
  },
  expenses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Expense',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
