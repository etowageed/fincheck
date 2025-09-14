const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all categories for the authenticated user (global + user specific)
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.getCategoriesForUser(req.user.id);

  res.status(200).json({
    success: true,
    results: categories.length,
    data: categories,
  });
});

// Create a new custom category
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  // Check if category name already exists for this user
  const existingCategory = await Category.findOne({
    name: name.trim(),
    userId: req.user.id,
    isActive: true,
  });

  if (existingCategory) {
    return next(new AppError('Category with this name already exists', 400));
  }

  const category = await Category.create({
    name: name.trim(),
    description: description?.trim(),
    userId: req.user.id,
    isGlobalDefault: false,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// Updated: Allow updating global defaults by auto-creating overrides
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const categoryId = req.params.id;

  // First, try to find user's own category
  let category = await Category.findOne({
    _id: categoryId,
    userId: req.user.id,
    isActive: true,
  });

  // If not found, check if it's a global default that user wants to modify
  if (!category) {
    const globalDefault = await Category.findOne({
      _id: categoryId,
      isGlobalDefault: true,
      isActive: true,
    });

    if (!globalDefault) {
      return next(new AppError('Category not found', 404));
    }

    // Check if user already has an override for this global default
    const existingOverride = await Category.findOne({
      userId: req.user.id,
      overridesGlobalDefault: categoryId,
      isActive: true,
    });

    if (existingOverride) {
      return next(
        new AppError('You already have a custom version of this category', 400)
      );
    }

    // Auto-create override with the new values
    category = await Category.create({
      name: name?.trim() || globalDefault.name,
      description: description?.trim() || globalDefault.description,
      userId: req.user.id,
      isGlobalDefault: false,
      overridesGlobalDefault: categoryId,
    });

    return res.status(200).json({
      success: true,
      data: category,
      message: 'Global default overridden with your custom version',
    });
  }

  // Update existing user category
  // Check if new name conflicts with existing categories
  if (name && name.trim() !== category.name) {
    const existingCategory = await Category.findOne({
      name: name.trim(),
      userId: req.user.id,
      isActive: true,
      _id: { $ne: category._id },
    });

    if (existingCategory) {
      return next(new AppError('Category with this name already exists', 400));
    }
  }

  // Update fields
  if (name) category.name = name.trim();
  if (description !== undefined) category.description = description?.trim();

  await category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});

// New: Dedicated endpoint to override a global default
exports.overrideGlobalDefault = catchAsync(async (req, res, next) => {
  const { globalCategoryId } = req.params;
  const { name, description } = req.body;

  // Check if global default exists
  const globalDefault = await Category.findOne({
    _id: globalCategoryId,
    isGlobalDefault: true,
    isActive: true,
  });

  if (!globalDefault) {
    return next(new AppError('Global default category not found', 404));
  }

  // Check if user already has an override for this global default
  const existingOverride = await Category.findOne({
    userId: req.user.id,
    overridesGlobalDefault: globalCategoryId,
    isActive: true,
  });

  if (existingOverride) {
    return next(
      new AppError('You already have a custom version of this category', 400)
    );
  }

  // Create override
  const override = await Category.create({
    name: name?.trim() || globalDefault.name,
    description: description?.trim() || globalDefault.description,
    userId: req.user.id,
    isGlobalDefault: false,
    overridesGlobalDefault: globalCategoryId,
  });

  res.status(201).json({
    success: true,
    data: override,
    message: 'Global default category overridden successfully',
  });
});

// Updated: Allow deleting global defaults by creating "hidden" override
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;

  // First, try to find user's own category
  let category = await Category.findOne({
    _id: categoryId,
    userId: req.user.id,
    isActive: true,
  });

  if (category) {
    // User's own category - soft delete
    category.isActive = false;
    await category.save();

    return res.status(204).json({
      success: true,
      data: null,
    });
  }

  // Check if it's a global default that user wants to "delete"
  const globalDefault = await Category.findOne({
    _id: categoryId,
    isGlobalDefault: true,
    isActive: true,
  });

  if (!globalDefault) {
    return next(new AppError('Category not found', 404));
  }

  // Check if user already has an override for this global default
  const existingOverride = await Category.findOne({
    userId: req.user.id,
    overridesGlobalDefault: categoryId,
  });

  if (existingOverride) {
    return next(
      new AppError('You already have a custom version of this category', 400)
    );
  }

  // Create "hidden" override (inactive) to hide the global default
  await Category.create({
    name: globalDefault.name,
    description: globalDefault.description,
    userId: req.user.id,
    isGlobalDefault: false,
    overridesGlobalDefault: categoryId,
    isActive: false, // This hides the global default
  });

  res.status(204).json({
    success: true,
    data: null,
    message: 'Global default category hidden from your view',
  });
});

// Admin only: Create global default categories
exports.createGlobalDefaults = catchAsync(async (req, res, next) => {
  const defaults = await Category.createGlobalDefaults();

  res.status(201).json({
    success: true,
    results: defaults.length,
    data: defaults,
  });
});

// Get global defaults (for admin or reference)
exports.getGlobalDefaults = catchAsync(async (req, res, next) => {
  const globalDefaults = await Category.getGlobalDefaults();

  res.status(200).json({
    success: true,
    results: globalDefaults.length,
    data: globalDefaults,
  });
});

// Restore to global default (delete override)
exports.restoreToGlobalDefault = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;

  const category = await Category.findOne({
    _id: categoryId,
    userId: req.user.id,
    isActive: true,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  if (!category.overridesGlobalDefault) {
    return next(
      new AppError('This category does not override a global default', 400)
    );
  }

  await category.restoreToGlobalDefault();

  res.status(200).json({
    success: true,
    message: 'Category restored to global default',
  });
});
