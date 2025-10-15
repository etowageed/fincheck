const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true,
    },

    password: {
      type: String, // must be hashed
      required: function () {
        // Password is only required if NONE of the social IDs are present
        return !this.googleId && !this.facebookId;
      },
      minLength: [8, 'Password must have atleast 8 characters'],
      select: false,
      trim: true, // trim whitespace
    },
    confirmPassword: {
      type: String,
      required: function () {
        // confirmPassword is only required if password is required and provided
        return !this.googleId && !this.facebookId && this.password;
      },
      validate: {
        // this only works on create() and save()
        validator: function (el) {
          // the .this only refers to the current document being created/saved
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    googleId: {
      // for google OAuth
      type: String,
      unique: true,
      sparse: true,
    },

    facebookId: {
      // for facebook OAuth
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      // Add this new role field
      type: String,
      enum: ['user', 'admin'], // Allowed roles
      default: 'user', // Default role for new users
    },

    // 💰 NEW FIELDS FOR MANUAL PREFERENCES
    preferredCurrency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    preferredLocale: {
      type: String,
      default: 'en-US',
      trim: true,
      minlength: 2,
    },
    // ----------------------------------

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirmPassword field
  this.confirmPassword = undefined;
  next();
});

// Middleware to update passwordChangedAt when password is changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken); // For debugging, remove in production

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
