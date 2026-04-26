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
    // For rule-based auto categorization
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
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
  },
);

// Static method to get all categories for a user (global + user specific)
categorySchema.statics.getCategoriesForUser = async function (
  userId,
  includeHidden = false
) {
  // 1. Get all global defaults
  const globalDefaults = await this.find({
    isGlobalDefault: true,
    isActive: true,
  });

  // 2. Get ALL of the user's categories and overrides (both active and inactive)
  const allUserCategories = await this.find({
    userId: userId,
  });

  // 3. Create a Set of all global category IDs that the user has an override for
  const overriddenGlobalIds = new Set();
  for (const cat of allUserCategories) {
    if (cat.overridesGlobalDefault) {
      overriddenGlobalIds.add(cat.overridesGlobalDefault.toString());
    }
  }

  // 4. Filter the main list of global defaults, removing any that have an override
  const visibleDefaults = globalDefaults.filter(
    (def) => !overriddenGlobalIds.has(def._id.toString()),
  );

  // 5. From the user's categories, filter based on isActive or includeHidden
  const filteredUserCategories = allUserCategories.filter(
    (cat) => includeHidden || cat.isActive,
  );

  // 6. Combine the visible defaults with the filtered user categories and sort
  return [...visibleDefaults, ...filteredUserCategories].sort((a, b) => {
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
    { name: 'Housing', description: 'Rent, mortgage, property tax' },
    {
      name: 'Bills & Utilities',
      description: 'Electricity, water, internet, phone',
    },
    { name: 'Food & Dining', description: 'Groceries, takeaways, restaurants' },
    { name: 'Transport', description: 'Fuel, public transport, car costs' },
    {
      name: 'Lifestyle',
      description: 'Shopping, personal care, subscriptions',
    },
    { name: 'Health', description: 'Medical expenses, pharmacy, insurance' },
    {
      name: 'Leisure & Travel',
      description: 'Entertainment, holidays, hobbies',
    },
    { name: 'Education & Growth', description: 'Courses, books, learning' },
    {
      name: 'Savings & Investments',
      description: 'Savings, stocks, emergency fund',
    },
    { name: 'Income', description: 'Salary, freelance, side income' },
  ];

  // Check if global defaults already exist
  const existingDefaults = await this.find({ isGlobalDefault: true });
  if (existingDefaults.length > 0) {
    console.log(
      'Global default categories already exist. Updating descriptions...',
    );

    // Update existing global defaults that match by name to ensure they have the new descriptions
    const updatePromises = defaultCategories.map((cat) =>
      this.updateOne(
        { name: cat.name, isGlobalDefault: true },
        { $set: { description: cat.description } },
      ),
    );
    await Promise.all(updatePromises);

    return this.find({ isGlobalDefault: true });
  }

  const categoryDocuments = defaultCategories.map((cat) => ({
    name: cat.name,
    description: cat.description,
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
