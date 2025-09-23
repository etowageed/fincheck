// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth store state on 401
      const authStore = useAuthStore();
      authStore.user = null;
      authStore.isAuthenticated = false;
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
