// src/services/auth.js
import api from "./api";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.get("/auth/logout");

export const forgotPassword = (email) =>
  api.post("/auth/forgotpassword", { email });

export const resetPassword = (token, data) =>
  api.patch(`/auth/resetpassword/${token}`, data);

export const updatePassword = (userId, data) => {
  // If no userId provided, use the authenticated user endpoint
  if (!userId) {
    return api.patch(`/users/me/password`, data);
  }
  // Otherwise use the admin endpoint with userId
  return api.patch(`/auth/${userId}/updatepassword`, data);
};

// Social logins - redirect to these (handled by backend passport)
export const googleLogin = () => (window.location.href = "/api/v1/auth/google");
export const facebookLogin = () =>
  (window.location.href = "/api/v1/auth/facebook");

// ✅ Get logged-in user
export const getCurrentUser = () => api.get("/users/me");

// Check if user is logged in
export const isLoggedIn = async () => {
  try {
    const res = await api.get("/auth/isLoggedIn");
    return res.data?.isLoggedIn === true; // ← Change "loggedIn" to "isLoggedIn"
  } catch {
    return false;
  }
};

// ✅ For an ADMIN to delete a user by their ID
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// ✅ For a LOGGED-IN USER to delete their own account
export const deleteMyAccount = () => api.delete("/users/me");

// ✅ Update user profile
export const updateProfile = (data) => api.patch("/users/me", data);
