import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "@/services/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  // error ref is no longer needed here

  // Getters
  const userProfile = computed(() => user.value);
  const authStatus = computed(() => ({
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
  }));

  // Getter for quick subscription status
  const subscriptionStatus = computed(
    () => user.value?.subscriptionStatus || "free"
  );

  // Getter for a simple boolean check (delegated decision making)
  const isPremium = computed(
    () =>
      subscriptionStatus.value === "premium" &&
      (!user.value.subscriptionExpires ||
        new Date(user.value.subscriptionExpires) > new Date())
  );

  // Actions
  const login = async (credentials) => {
    isLoading.value = true;
    try {
      const response = await authService.login(credentials);
      if (response.data?.status === "success") {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        return { success: true };
      }
    } catch (error) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (userData) => {
    isLoading.value = true;
    try {
      const response = await authService.signup(userData);
      if (response.data?.status === "success") {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        return { success: true };
      }
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    try {
      await authService.logout();
      user.value = null;
      isAuthenticated.value = false;
      return { success: true };
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    isLoading.value = true;
    try {
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
      if (err.response?.status !== 401) {
        console.error("Auth check failed:", err);
      }
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

    // Only send the fields that can be updated
    const dataToSend = {
      name: profileData.name,
      email: profileData.email,
      preferredCurrency: profileData.preferredCurrency,
      preferredLocale: profileData.preferredLocale,
    };

    try {
      const response = await authService.updateProfile(dataToSend);
      if (response.data?.success) {
        // Update the local user object with the new data returned from the API
        user.value = { ...user.value, ...response.data.data };
        return { success: true };
      }
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const updatePassword = async (passwordData) => {
    isLoading.value = true;
    try {
      const response = await authService.updatePassword(
        user.value?.id,
        passwordData
      );
      return { success: true, message: response.data?.message };
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const forgotPassword = async (email) => {
    isLoading.value = true;
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async (token, data) => {
    isLoading.value = true;
    try {
      await authService.resetPassword(token, data);
      return { success: true };
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAccount = async () => {
    isLoading.value = true;
    try {
      await authService.deleteMyAccount(); // Clear user state after successful deletion
      user.value = null;
      isAuthenticated.value = false;
      return { success: true };
    } catch (err) {
      // Error is handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    userProfile,
    authStatus,
    subscriptionStatus,
    isPremium, // Expose the new computed boolean
    login,
    signup,
    logout,
    checkAuth,
    initializeAuth,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,
  };
});
