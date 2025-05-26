const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

// creating the jwt token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// sign up
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1) basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a name, email and password',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with email already exists',
      });
    }
    // 3) Hash the password (actually happens in the presave hook)

    //  4) finally create new user
    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
      income: req.body.income || 0,
      expenses: [],
    });
    // 5) create and send JWT
    const token = createToken(newUser._id);
    // 6) hide password in response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error during signup',
    });
  }
};

// login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password are entered

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // 2a) find user by email and check if user exists and pwd is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }

    // 2b) verify password by comparing entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }
    // TODO:add dummy bcrypt to prevent timing attacks

    // 3) create and send jwt
    const token = createToken(user._id);
    user.password = undefined; // this hides the password in the response

    // 4) send user data
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login',
    });
  }
  next();
};

// check login status
exports.isLoggedIn = async (req, res, next) => {
  try {
    // TODO: make this into a function so it can be reused b/w protect and isLoggedIn
    let token;

    //  1) get token if it still exists
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'loggedout') {
      return res.status(200).json({
        status: 'success',
        isLoggedIn: false,
      });
    }

    // 2) verifying if token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(200).json({
        status: 'success',
        isLoggedIn: false,
      });
    }
    // 4) check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(200).json({
        status: 'success',
        isLoggedIn: false,
      });
    }
    // Auto-initialize monthly expense document if missing // TODO modularize this part
    // and import so as to keep this
    // isLoggedIn function generalized

    // Inside isLoggedIn, after verifying token and fetching user
    // const today = new Date();
    // const currentMonth = today.getMonth(); // 0-indexed
    // const currentYear = today.getFullYear();

    // const existingDoc = await Expense.findOne({
    //   user: user._id,
    //   month: currentMonth,
    //   year: currentYear,
    // });

    // if (!existingDoc) {
    //   console.log('Creating new monthly expense doc for user:', user._id); // ✅ Add this log
    //   await Expense.create({
    //     user: user._id,
    //     month: currentMonth,
    //     year: currentYear,
    //     income: user.income || 0,
    //     fixedExpenses: [],
    //     transactions: [],
    //   });
    // }

    // 5) if user is logged in
    res.status(200).json({
      status: 'success',
      isLoggedIn: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          income: user.income,
        },
      },
    });
  } catch (err) {
    // we don't show errors for this route, we just say user is not logged in
    res.status(200).json({
      status: 'success',
      isLoggedIn: false,
    });
  }
};

// protect routes
exports.protect = async (req, res, next) => {
  try {
    // 1) get the token and see if it still exists
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in for access',
      });
    }

    // 2) verifying if token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists',
      });
    }
    // 4) check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password! Please login again',
      });
    }

    // 5) now grant access to the protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.',
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired. Please log in again.',
      });
    }

    console.error('Auth protection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication',
    });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    // 1) get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email address',
      });
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // this helps to turn
    // of the validation from the model since we're using only the email

    // 3) send the token to the user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetPassword/${resetToken}`;

    try {
      // TODO: create email service functionality like that from natours project
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Your password reset token (valid for 10min)',
      //   message,
      //   html: message,
      // });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
        resetURL, //TODO: we don't send this in productiomn
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'Error sending email. Try again later',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error processing password reset request',
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    // 1) get user based on the token created during forgot password
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) if token has not expired and there's a user, then set new password
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired',
      });
    }
    // 3) update password and remove reset token fields
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a new password',
      });
    }

    (user.password = req.body.password),
      (user.confirmPassword = req.body.confirmPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    // 4) log the user in and send jwt
    const token = createToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password (pre-save middleware will handle hashing)
    user.password = newPassword;
    user.confirmPassword = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// logout
exports.logout = async (req, res) => {
  try {
    // clear Jwt
    res.cookie('jwt', 'loggedout', {
      expires: new Date(0), // jwt token expires immediately
      httpOnly: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out',
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
    });
  }
};
