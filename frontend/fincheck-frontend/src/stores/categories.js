import { defineStore } from "pinia";
import { ref, computed } from "vue";
import CategoryService from "@/services/categoryService";

export const useCategoriesStore = defineStore("categories", () => {
  // State
  const categories = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const getCategoryById = computed(() => (id) => {
    return categories.value.find((cat) => cat._id === id);
  });

  const getAllCategories = computed(() => categories.value);

  const separatedCategories = computed(() => {
    return {
      globalDefaults: categories.value.filter((c) => c.isGlobalDefault),
      userCustom: categories.value.filter(
        (c) => !c.isGlobalDefault && !c.overridesGlobalDefault
      ),
      userOverrides: categories.value.filter((c) => c.overridesGlobalDefault),
    };
  });

  // Actions
  const fetchCategories = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await CategoryService.getCategories();

      if (response.data?.status === "success") {
        categories.value = response.data.data;
        return true;
      }

      if (response.success && Array.isArray(response.data)) {
        categories.value = response.data;
        return true;
      }

      error.value = response.data?.message || "Failed to fetch categories";
      return false;
    } catch (err) {
      console.error("Categories fetch error:", err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const createCategory = async (categoryData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await CategoryService.createCategory(categoryData);

      if (response.success && response.data) {
        // Update local categories array
        categories.value = [...categories.value, response.data];
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      error.value = response.error || "Failed to create category";
      return {
        success: false,
        error: error.value,
      };
    } catch (err) {
      const errorMessage = err.message || "Failed to create category";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const updateCategory = async (id, categoryData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await CategoryService.updateCategory(id, categoryData);
      // 1. Check the correct 'success' property
      if (response.success) {
        // 2. Access the new category data from 'response.data'
        const updatedCategory = response.data;
        const index = categories.value.findIndex((c) => c._id === id);

        if (index !== -1) {
          // This correctly replaces the old default with the new override in the UI
          categories.value[index] = updatedCategory;
        }
        return { success: true, category: updatedCategory };
      }
      // Pass along the formatted error from the service
      return { success: false, error: response.error };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteCategory = async (id) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await CategoryService.deleteCategory(id);
      // Check the 'success' property from the service response object
      if (response.success) {
        // This will now execute correctly, updating the UI
        categories.value = categories.value.filter((c) => c._id !== id);
        return { success: true };
      }
      // The service already formatted the error, so we just pass it along
      return { success: false, error: response.error };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const restoreCategory = async (id) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await CategoryService.restoreToGlobalDefault(id);
      if (response.success) {
        // After a successful restore, refetch the entire list
        // to ensure the UI is perfectly in sync with the backend.
        await fetchCategories();
        return { success: true, message: response.message };
      }
      return { success: false, error: response.error };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    categories,
    isLoading,
    error,

    // Getters
    getCategoryById,
    getAllCategories,
    separatedCategories,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  };
});
