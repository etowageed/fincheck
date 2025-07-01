const mongoose = require('mongoose');

// subdocument schema for recurring expenses(aka monthlyBudget) (e.g. rent)

const monthlyBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true, // trim whitespace
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount must be positive'],
  },
});

// subdocument schema for actual transactions (money spent)
const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Transaction description is required'], // Added required validation
    trim: true, // Ensured trimming
  },

  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Transaction category is required'], // Added required validation
    trim: true, // Ensured trimming
    default: 'Uncategorized', // Ensured default
  },

  type: {
    type: String,
    enum: ['actual', 'excluded'],
    default: 'actual',
  }, // 'excluded expenses = savings/investments
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
    month: {
      type: Number,
      min: [0, 'Month must be between 0 (Jan) and 11 (Dec)'], // Ensured min validation with message
      max: [11, 'Month must be between 0 (Jan) and 11 (Dec)'], // Ensured max validation with message
      default: () => new Date().getMonth(), // Automatically sets to current month (0-indexed)
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(), // Automatically sets to current year
    },
    income: {
      type: Number,
      default: 0,
      min: [0, 'Income cannot be negative'], // Ensured min validation
    },
    monthlyBudget: {
      type: [monthlyBudgetSchema],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A budget must contain at least one item!',
      },
    },
    transactions: [transactionSchema],
  },
  {
    timestamps: true, // Added timestamps as per your current file
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure unique monthly expense document per user
// This index will still work correctly with default values for month and year.
expenseSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

// virtual properties = computed fields that are not stored in the database
// but calculated dynamically whenever a document is read

// Virtual properties = computed fields that are not stored in the database
expenseSchema.virtual('totalMonthlyBudget').get(function () {
  return this.monthlyBudget.reduce((sum, exp) => sum + exp.amount, 0);
});

expenseSchema.virtual('actualSpend').get(function () {
  return this.transactions
    .filter((t) => t.type === 'actual')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

expenseSchema.virtual('excludedTotal').get(function () {
  return this.transactions
    .filter((t) => t.type === 'excluded')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

expenseSchema.virtual('safeToSpend').get(function () {
  return (
    this.income -
    this.totalMonthlyBudget -
    this.actualSpend -
    this.excludedTotal
  );
});

expenseSchema.virtual('netSpend').get(function () {
  return this.actualSpend + this.excludedTotal;
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
