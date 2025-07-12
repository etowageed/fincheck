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

  isRecurring: {
    type: Boolean,
    default: true, // Default to true for recurring expenses
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
    required: [true, 'Transaction type is required'], // Added required validation
    enum: ['expense', 'excludedExpense', 'income'],
    default: 'expense',
  }, // 'excluded expenses = savings/investments
  date: { type: Date, default: Date.now },
});

// main expense schema

const financesSchema = new mongoose.Schema(
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
financesSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

// virtual properties = computed fields that are not stored in the database
// but calculated dynamically whenever a document is read

// Virtual properties = computed fields that are not stored in the database

financesSchema.virtual('totalMonthlyBudget').get(function () {
  return this.monthlyBudget.reduce((sum, exp) => sum + exp.amount, 0);
});

// Total recurring budget = sum of all recurring expenses in the monthly budget
financesSchema.virtual('totalRecurringExpenses').get(function () {
  return this.monthlyBudget
    .filter((item) => item.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);
});

// Total non-recurring expenses = sum of all non-recurring expenses in the monthly budget
financesSchema.virtual('totalNonRecurringExpenses').get(function () {
  return this.monthlyBudget
    .filter((item) => !item.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);
});

// total expenses
financesSchema.virtual('expensesTotal').get(function () {
  return this.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// total income
financesSchema.virtual('incomeTotal').get(function () {
  return this.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// total excluded expenses (savings/investments)
financesSchema.virtual('excludedExpensesTotal').get(function () {
  return this.transactions
    .filter((t) => t.type === 'excludedExpense')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// safe to spend
financesSchema.virtual('safeToSpend').get(function () {
  return this.incomeTotal - this.totalMonthlyBudget - this.outflow;
});

financesSchema.virtual('outflow').get(function () {
  return this.expensesTotal + this.excludedExpensesTotal;
});

// expenses performance
financesSchema.virtual('expensesPerformance').get(function () {
  const budget = this.totalMonthlyBudget;
  const expenses = this.expensesTotal;
  if (budget === 0) {
    return { status: 'safe', percentageUsed: 0 }; // No budget set, always safe
  }
  const percentageUsed = Math.round((expenses / budget) * 100);
  // Below 90% of budget is 'safe', 90% or above is 'danger'
  const status = percentageUsed < 90 ? 'safe' : 'danger';
  return { status, percentageUsed };
});

const Finances = mongoose.model('Finances', financesSchema);

module.exports = Finances;
