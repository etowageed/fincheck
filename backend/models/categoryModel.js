const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    isGlobalDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: function () {
        return !this.isGlobalDefault; // Only required for user categories
      },
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    // For user overrides of global defaults
    overridesGlobalDefault: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ isGlobalDefault: 1, isActive: 1 });
categorySchema.index({ overridesGlobalDefault: 1 });

// Ensure unique category names per user (excluding global defaults)
categorySchema.index(
  { name: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
      isGlobalDefault: false,
    },
  }
);

// Static method to get all categories for a user (global + user specific)
categorySchema.statics.getCategoriesForUser = async function (userId) {
  // 1. Get all global defaults
  const globalDefaults = await this.find({
    isGlobalDefault: true,
    isActive: true,
  });

  // 2. Get user's custom categories and overrides
  const userCategories = await this.find({
    userId: userId,
    isActive: true,
  });

  // 3. Get IDs of overridden global defaults
  const overriddenIds = userCategories
    .filter((cat) => cat.overridesGlobalDefault)
    .map((cat) => cat.overridesGlobalDefault.toString());

  // 4. Filter out overridden defaults
  const activeDefaults = globalDefaults.filter(
    (def) => !overriddenIds.includes(def._id.toString())
  );

  // 5. Combine active defaults + user categories
  return [...activeDefaults, ...userCategories].sort((a, b) => {
    // Sort: global defaults first, then user categories, alphabetically
    if (a.isGlobalDefault && !b.isGlobalDefault) return -1;
    if (!a.isGlobalDefault && b.isGlobalDefault) return 1;
    return a.name.localeCompare(b.name);
  });
};

// Static method to get only global default categories
categorySchema.statics.getGlobalDefaults = async function () {
  return this.find({
    isGlobalDefault: true,
    isActive: true,
  }).sort({ name: 1 });
};

// Static method to get only user's custom categories
categorySchema.statics.getUserCustomCategories = async function (userId) {
  return this.find({
    userId: userId,
    isActive: true,
  }).sort({ name: 1 });
};

// Static method to create global default categories (run once)
categorySchema.statics.createGlobalDefaults = async function () {
  const defaultCategories = [
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Housing',
    'Education',
    'Travel',
    'Insurance',
    'Savings',
    'Investments',
    'Debt Payment',
    'Gifts & Donations',
    'Personal Care',
    'Salary',
    'Freelance',
    'Business Income',
    'Investment Returns',
    'Other Income',
  ];

  // Check if global defaults already exist
  const existingDefaults = await this.find({ isGlobalDefault: true });
  if (existingDefaults.length > 0) {
    console.log('Global default categories already exist');
    return existingDefaults;
  }

  const categoryDocuments = defaultCategories.map((name) => ({
    name,
    isGlobalDefault: true,
    userId: null,
  }));

  const created = await this.insertMany(categoryDocuments);
  console.log(`Created ${created.length} global default categories`);
  return created;
};

// Instance method to check if this category overrides a global default
categorySchema.methods.isOverride = function () {
  return Boolean(this.overridesGlobalDefault);
};

// Instance method to restore to global default (delete override)
categorySchema.methods.restoreToGlobalDefault = async function () {
  if (!this.overridesGlobalDefault) {
    throw new Error('This category does not override a global default');
  }

  // Simply delete the override - global default will show up again
  return this.deleteOne();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
