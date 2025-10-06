// src/stores/categories.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import CategoryService from "@/services/categoryService";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref([]);
  const isLoading = ref(false);

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

  const fetchCategories = async () => {
    isLoading.value = true;
    try {
      const response = await CategoryService.getCategories();
      if (response.success && Array.isArray(response.data)) {
        categories.value = response.data;
      }
    } catch (err) {
      // Error is handled by the global interceptor
    } finally {
      isLoading.value = false;
    }
  };

  const createCategory = async (categoryData) => {
    isLoading.value = true;
    try {
      const response = await CategoryService.createCategory(categoryData);
      if (response.success && response.data) {
        await fetchCategories(); // refetch to keep the list consistent
        return { success: true, data: response.data };
      }
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const updateCategory = async (id, categoryData) => {
    isLoading.value = true;
    try {
      const response = await CategoryService.updateCategory(id, categoryData);
      if (response.success) {
        await fetchCategories();
        return { success: true, category: response.data };
      }
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteCategory = async (id) => {
    isLoading.value = true;
    try {
      const response = await CategoryService.deleteCategory(id);
      if (response.success) {
        await fetchCategories();
        return { success: true };
      }
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const restoreCategory = async (id) => {
    isLoading.value = true;
    try {
      const response = await CategoryService.restoreToGlobalDefault(id);
      if (response.success) {
        await fetchCategories();
        return { success: true, message: response.message };
      }
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    categories,
    isLoading,
    getCategoryById,
    getAllCategories,
    separatedCategories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  };
});
