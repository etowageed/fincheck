const mongoose = require('mongoose');
const validator = require('validator');
const Expense = require('./expenseModel');

const userSchema = new mongoose.Schema(
  {
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
      default: 0,
    },
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means password was not changed
  return false;
};

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Set passwordChangedAt to current time minus 1 second
  // (to ensure the token is always created after password change)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
