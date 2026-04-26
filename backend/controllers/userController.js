// backend/controllers/userController.js
const User = require('../models/userModel');
const Finances = require('../models/financesModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// getting all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // 1) create APIFeatures instance
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields(['password'])
    .paginate();

  // 2) get results with metadata
  const result = await features.getResults();

  res.status(200).json(result);
});

// getting a single user
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id, '-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true, // Keeping 'success' here for consistency with original format for this route
    data: user,
  });
});

// No createUser handler for now

// updating a user

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, subscriptionStatus, role } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
  if (role) updateData.role = role;

  // checking if email being updated and already exists
  if (email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
  }
  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    select: '-password',
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true, // Keeping 'success' here for consistency with original format for this route
    data: user,
  });
});

// updating me (the logged-in user)
exports.updateMe = catchAsync(async (req, res, next) => {
  // note that subscriptionStatus and subscriptionExpires are not updateable by the user
  const { name, email, preferredCurrency, preferredLocale } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  // Add preferredCurrency and preferredLocale to updateData
  if (preferredCurrency) updateData.preferredCurrency = preferredCurrency;
  if (preferredLocale) updateData.preferredLocale = preferredLocale;

  // checking if email being updated and already exists
  if (email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id }, // <-- use req.user.id here
    });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
  }
  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    // <-- use req.user.id here
    new: true,
    runValidators: true,
    select:
      'subscriptionStatus subscriptionExpires preferredCurrency preferredLocale name email role _id',
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true, // Keeping 'success' here for consistency with original format for this route
    message: 'User deleted successfully',
    data: {},
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  // It's good practice to clear the JWT cookie on account deletion
  res.cookie('jwt', 'loggedout', {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    'subscriptionStatus subscriptionExpires preferredCurrency preferredLocale name email role _id goals'
  );
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // --- ALL THE DASHBOARD AND FINANCES LOGIC IS REMOVED ---

  res.status(200).json({
    status: 'success',
    data: {
      user,
      // The dashboard object is no longer sent from this endpoint
    },
  });
});

// Goals operations

exports.addGoal = catchAsync(async (req, res, next) => {
  const { name, targetAmount, icon } = req.body;

  if (!name || !targetAmount) {
    return next(new AppError('Goal must have a name and target amount', 400));
  }

  const user = await User.findById(req.user.id);

  if (user.subscriptionStatus !== 'premium' && user.goals.length >= 1) {
    return next(new AppError('Free users can only create 1 goal. Please upgrade to Premium for unlimited goals.', 403));
  }

  user.goals.push({ name, targetAmount, icon });
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: user.goals,
  });
});

exports.updateGoal = catchAsync(async (req, res, next) => {
  const goalId = req.params.id;
  const { name, targetAmount, icon, currentAmount } = req.body;

  const user = await User.findById(req.user.id);
  const goal = user.goals.id(goalId);

  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  if (name) goal.name = name;
  if (targetAmount !== undefined) goal.targetAmount = targetAmount;
  if (icon) goal.icon = icon;
  if (currentAmount !== undefined) goal.currentAmount = currentAmount;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: goal,
  });
});

exports.deleteGoal = catchAsync(async (req, res, next) => {
  const goalId = req.params.id;
  const user = await User.findById(req.user.id);

  user.goals.pull({ _id: goalId });
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
