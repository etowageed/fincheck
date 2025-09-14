import api from "./api";

export class CategoryService {
  /**
   * Get all categories for the authenticated user (global defaults + user overrides/custom)
   */
  static async getCategories() {
    try {
      const response = await api.get("/categories");
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.results || 0,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch categories",
        data: [],
      };
    }
  }

  /**
   * Create a new custom category
   */
  static async createCategory(categoryData) {
    try {
      const response = await api.post("/categories", categoryData);
      return {
        success: true,
        data: response.data.data,
        message: "Category created successfully",
      };
    } catch (error) {
      console.error("Error creating category:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create category",
      };
    }
  }

  /**
   * Update a category (auto-creates override for global defaults)
   */
  static async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.patch(
        `/categories/${categoryId}`,
        categoryData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Category updated successfully",
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update category",
      };
    }
  }

  /**
   * Delete a category (soft delete for custom, hidden override for global defaults)
   */
  static async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return {
        success: true,
        message: response.data.message || "Category deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete category",
      };
    }
  }

  /**
   * Explicitly override a global default category
   */
  static async overrideGlobalDefault(globalCategoryId, categoryData) {
    try {
      const response = await api.post(
        `/categories/override/${globalCategoryId}`,
        categoryData
      );
      return {
        success: true,
        data: response.data.data,
        message:
          response.data.message || "Global default overridden successfully",
      };
    } catch (error) {
      console.error("Error overriding global default:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to override global default",
      };
    }
  }

  /**
   * Restore to global default (remove user's override)
   */
  static async restoreToGlobalDefault(categoryId) {
    try {
      const response = await api.patch(
        `/categories/${categoryId}/restore-to-global`
      );
      return {
        success: true,
        message: response.data.message || "Category restored to global default",
      };
    } catch (error) {
      console.error("Error restoring to global default:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to restore to global default",
      };
    }
  }

  /**
   * Get global default categories (admin/reference)
   */
  static async getGlobalDefaults() {
    try {
      const response = await api.get("/categories/global-defaults");
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.results || 0,
      };
    } catch (error) {
      console.error("Error fetching global defaults:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch global defaults",
        data: [],
      };
    }
  }

  /**
   * Create global default categories (admin only)
   */
  static async createGlobalDefaults() {
    try {
      const response = await api.post("/categories/global-defaults");
      return {
        success: true,
        data: response.data.data,
        count: response.data.results,
        message: "Global default categories created successfully",
      };
    } catch (error) {
      console.error("Error creating global defaults:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to create global defaults",
      };
    }
  }

  /**
   * Helper: Format categories for dropdown/select usage
   */
  static formatCategoriesForDropdown(categories) {
    return categories.map((category) => ({
      value: category._id,
      label: category.name,
      isGlobal: category.isGlobalDefault,
      isOverride: Boolean(category.overridesGlobalDefault),
      canRestore: Boolean(category.overridesGlobalDefault),
      description: category.description,
    }));
  }

  /**
   * Helper: Separate global defaults and user categories
   */
  static separateCategories(categories) {
    return {
      globalDefaults: categories.filter((cat) => cat.isGlobalDefault),
      userCustom: categories.filter(
        (cat) => !cat.isGlobalDefault && !cat.overridesGlobalDefault
      ),
      userOverrides: categories.filter(
        (cat) => !cat.isGlobalDefault && cat.overridesGlobalDefault
      ),
    };
  }

  /**
   * Helper: Check if user can edit a category
   */
  static canEditCategory(category) {
    // Users can edit their own categories and override global defaults
    return (
      !category.isGlobalDefault || Boolean(category.overridesGlobalDefault)
    );
  }

  /**
   * Helper: Check if user can delete a category
   */
  static canDeleteCategory(category) {
    // Users can delete custom categories or hide global defaults
    return true; // All categories can be "deleted" (custom deleted, global hidden)
  }
}

export default CategoryService;
