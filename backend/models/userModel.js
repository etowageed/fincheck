const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
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
    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // this only works on create() and save()
        validator: function (el) {
          // the .this only refers to the current document being created/saved
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
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
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// instance method that creates a password reset token
userSchema.methods.createPasswordResetToken = function () {
  // 1) generate random token

  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2) hash the token and store in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3) set expiration for 10minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4) Return the unhashed token to user // TODO:via email

  return resetToken;
};

// Password management and encryption
userSchema.pre('save', async function (next) {
  //  Only hash if password was modified
  if (!this.isModified('password')) return next();

  // now hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // remove confirmPassword after validation
  this.confirmPassword = undefined;
  next();
});

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
