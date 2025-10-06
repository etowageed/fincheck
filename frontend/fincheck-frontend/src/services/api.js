import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useErrorStore } from "@/stores/error";
import router from "@/router";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle all errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorStore = useErrorStore();
    const originalRequest = error.config;

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    // ** ADD THIS BLOCK TO HIDE THE SPECIFIC ERROR **
    // This is a normal state for new users, not a true "error" to be shown.
    if (errorMessage === "No expense document found for this month and year.") {
      // Reject the promise without setting a global error
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors specifically for session expiration
    if (
      error.response?.status === 401 &&
      !originalRequest.url.endsWith("/login") &&
      !originalRequest.url.endsWith("/signup")
    ) {
      const authStore = useAuthStore();

      if (authStore.isAuthenticated) {
        authStore.user = null;
        authStore.isAuthenticated = false;
        // The router guard will automatically redirect now that isAuthenticated is false
      }
    }

    // For all other errors, set the global error for the toast to display
    errorStore.setError(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
