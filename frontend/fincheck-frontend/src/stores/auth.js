import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "@/services/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const userProfile = computed(() => user.value);
  const authStatus = computed(() => ({
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
    error: error.value,
  }));

  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true;
      const response = await authService.login(credentials);

      if (response.data?.status === "success") {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        return { success: true };
      }

      return {
        success: false,
        message: response.data?.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (userData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.signup(userData);
      if (response.data?.status === "success") {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        return { success: true };
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Signup failed";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      await authService.logout();
      user.value = null;
      isAuthenticated.value = false;
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "Logout failed";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Use getCurrentUser instead of isLoggedIn since it's more reliable
      const response = await authService.getCurrentUser();

      if (response.data?.status === "success") {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        return true;
      }

      user.value = null;
      isAuthenticated.value = false;
      return false;
    } catch (err) {
      console.error("Auth check failed:", err);
      user.value = null;
      isAuthenticated.value = false;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize auth state
  const initializeAuth = async () => {
    await checkAuth();
  };

  const updateProfile = async (profileData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.updateProfile(profileData);
      if (response.data?.success) {
        user.value = { ...user.value, ...response.data.data };
        return { success: true };
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Profile update failed";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const updatePassword = async (passwordData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.updatePassword(
        user.value?.id,
        passwordData
      );
      return { success: true, message: response.data?.message };
    } catch (err) {
      error.value = err.response?.data?.message || "Password update failed";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const resetError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Getters
    userProfile,
    authStatus,

    // Actions
    login,
    signup,
    logout,
    checkAuth,
    initializeAuth,
    updateProfile,
    updatePassword,
    resetError,
  };
});

// TODO integrate the store to header and sidebar components
