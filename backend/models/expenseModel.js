const mongoose = require('mongoose');
const User = require('./userModel');

// subdocument schema for fixed recurring expenses (e.g. rent)

const fixedExpenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
});

// subdocument schema for actual transactions (money spent)
const transactionSchema = new mongoose.Schema({
  description: { type: String },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['actual', 'excluded'], default: 'actual' }, // 'excluded expenses = savings/investments
  date: { type: Date, default: Date.now },
});

// main expense schema
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },

    income: { type: Number, default: 0 },

    fixedExpenses: [fixedExpenseSchema],
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // this enables the virtual properties
    toObject: { virtuals: true },
  }
);

// virtual properties = computed fields that are not stored in the database
// but calculated dynamically whenever a document is read

// totalFixedExpenses - adds up all the amounts from the fixedExpenses array
expenseSchema.virtual('totalFixedExpenses').get(function () {
  return this.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
});

// actualSpend - calculates the 'actual' expenses and ignores the 'excluded'

expenseSchema.virtual('actualSpend').get(function () {
  return this.transactions
    .filter((t) => t.type === 'actual')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// safeToSpend calculates all the money left to spend for the month

expenseSchema.virtual('safeToSpend').get(function () {
  return this.income - this.totalFixedExpenses - this.actualSpend;
});

// index to prevent duplication of monthly budgets

expenseSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
