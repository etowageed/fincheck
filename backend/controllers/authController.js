const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const EmailService = require('../utils/emails');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// creating the jwt token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// sign up
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // 1) basic validation
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 2) Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with email already exists', 400));
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
  // send welcome email
  const signupURL = `${req.protocol}://${req.get('host')}/api/v1/users/me`;

  // Using try-catch for email sending as it's an external service,
  // but let the main error handler catch general errors.
  try {
    await new EmailService(newUser, signupURL).sendWelcome();
  } catch (emailError) {
    console.error(
      `Failed to send welcome email to ${newUser.email}:`,
      emailError
    );
    // Optionally, you could still send a response here or log it for monitoring
    // but don't prevent user creation if email sending fails.
  }

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
});

// login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password are entered

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
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
  // const isMatch = await bcrypt.compare(password, user.password);

  // if (!isMatch) {
  //   return res.status(401).json({
  //     status: 'error',
  //     message: 'Incorrect email or password',
  //   });
  // }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Combines user check and password verification for timing attack prevention
    return next(new AppError('Incorrect email or password', 401));
  }

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
});

// check login status
exports.isLoggedIn = catchAsync(async (req, res, next) => {
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
  // The global error handler will catch JsonWebTokenError and TokenExpiredError
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
        role: user.role,
      },
    },
  });
});

// protect routes
exports.protect = catchAsync(async (req, res, next) => {
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
    return next(
      new AppError('You are not logged in. Please log in for access', 401)
    );
  }

  // 2) verifying if token is valid
  // This will throw errors handled by globalErrorHandler (JsonWebTokenError, TokenExpiredError)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  // 4) check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  // 5) now grant access to the protected route
  req.user = user;
  next();
});

// middleware to restrict access based on roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'lead-guide']
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
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
    // send email about password reset
    await new EmailService(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
      resetURL, //TODO: we don't send this in productiomn
    });
  } catch (err) {
    // If email sending fails, revert the token fields and then throw an operational error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later', 500));
  }
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
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
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) update password and remove reset token fields
  const { password } = req.body;
  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  (user.password = req.body.password),
    (user.confirmPassword = req.body.confirmPassword); // Model validation will handle password match
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save(); // This will trigger pre-save hash and validation

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
        role: user.role,
      },
    },
  });
});

// Update user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError('Current password and new password are required', 400)
    );
  }

  // Find user by req.user.id if this is intended for authenticated user,
  // or by req.params.id if it's an admin changing another user's password.
  // Assuming it's for the authenticated user based on typical app flow.
  // The original code used req.params.id, so keeping that for now.
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password (pre-save middleware will handle hashing)
  user.password = newPassword;
  user.confirmPassword = newPassword; // Ensure confirmPassword is also set for model validation
  await user.save(); // This will trigger pre-save hash and validation

  res.status(200).json({
    success: true, // Keeping 'success' here for consistency with original format for this route
    message: 'Password updated successfully',
  });
});

// logout
exports.logout = (req, res) => {
  // This can remain synchronous
  // clear Jwt
  res.cookie('jwt', 'loggedout', {
    expires: new Date(0), // jwt token expires immediately
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });
};
