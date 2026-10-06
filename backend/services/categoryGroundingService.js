const Category = require('../models/categoryModel');

/**
 * Service to ground AI category proposals in the user's actual database categories
 */

/**
 * Fetches categories available to user and formats them for prompt injection
 */
const getFormattedUserCategories = async (userId) => {
  const categories = await Category.getCategoriesForUser(userId);
  return categories.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
    description: cat.description || '',
  }));
};

/**
 * Matches a proposed category string against available user category objects
 */
const matchCategory = (proposedName, availableCategories) => {
  if (!proposedName || typeof proposedName !== 'string') {
    const defaultCat = availableCategories.find(
      (c) => c.name.toLowerCase() === 'uncategorised' || c.name.toLowerCase() === 'uncategorized'
    ) || availableCategories[0];
    return {
      categoryName: defaultCat ? defaultCat.name : 'Uncategorised',
      isGrounded: false,
      originalProposal: proposedName || '',
    };
  }

  const cleanProposed = proposedName.trim().toLowerCase();

  // 1. Direct case-insensitive match
  const exactMatch = availableCategories.find(
    (c) => c.name.trim().toLowerCase() === cleanProposed
  );
  if (exactMatch) {
    return {
      categoryName: exactMatch.name,
      isGrounded: true,
      originalProposal: proposedName,
    };
  }

  // 2. Substring / keyword matching
  const partialMatch = availableCategories.find((c) => {
    const catLower = c.name.toLowerCase();
    return catLower.includes(cleanProposed) || cleanProposed.includes(catLower);
  });
  if (partialMatch) {
    return {
      categoryName: partialMatch.name,
      isGrounded: true,
      originalProposal: proposedName,
    };
  }

  // 3. Common synonym heuristics fallback
  const synonymMap = {
    food: 'Food & Dining',
    groceries: 'Food & Dining',
    dining: 'Food & Dining',
    restaurant: 'Food & Dining',
    coffee: 'Food & Dining',
    takeaway: 'Food & Dining',
    rent: 'Housing',
    mortgage: 'Housing',
    utility: 'Bills & Utilities',
    electricity: 'Bills & Utilities',
    water: 'Bills & Utilities',
    internet: 'Bills & Utilities',
    phone: 'Bills & Utilities',
    fuel: 'Transport',
    uber: 'Transport',
    taxi: 'Transport',
    travel: 'Leisure & Travel',
    shopping: 'Lifestyle',
    salary: 'Income',
  };

  for (const [kw, targetCat] of Object.entries(synonymMap)) {
    if (cleanProposed.includes(kw)) {
      const match = availableCategories.find(
        (c) => c.name.toLowerCase() === targetCat.toLowerCase()
      );
      if (match) {
        return {
          categoryName: match.name,
          isGrounded: true,
          originalProposal: proposedName,
        };
      }
    }
  }

  // 4. Default fallback to Uncategorised
  const uncategorisedCat = availableCategories.find(
    (c) => c.name.toLowerCase() === 'uncategorised' || c.name.toLowerCase() === 'uncategorized'
  );

  return {
    categoryName: uncategorisedCat ? uncategorisedCat.name : availableCategories[0]?.name || 'Uncategorised',
    isGrounded: false,
    originalProposal: proposedName,
  };
};

/**
 * Ground an array of proposed items with user's DB categories
 */
const groundTransactionProposals = async (userId, proposals) => {
  const userCategories = await Category.getCategoriesForUser(userId);

  return proposals.map((item) => {
    const grounded = matchCategory(item.category, userCategories);
    return {
      ...item,
      category: grounded.categoryName,
      categoryGrounded: grounded.isGrounded,
      originalCategoryProposal: grounded.originalProposal,
    };
  });
};

module.exports = {
  getFormattedUserCategories,
  matchCategory,
  groundTransactionProposals,
};
