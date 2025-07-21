// src/services/auth.js
import api from "./api";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.get("/auth/logout");
export const isLoggedIn = () => api.get("/auth/isLoggedIn");

export const forgotPassword = (email) =>
  api.post("/auth/forgotpassword", { email });

export const resetPassword = (token, data) =>
  api.patch(`/auth/resetpassword/${token}`, data);

export const updatePassword = (userId, data) =>
  api.patch(`/auth/${userId}/updatepassword`, data);

// Social logins - redirect to these (handled by backend passport)
export const googleLogin = () => (window.location.href = "/api/v1/auth/google");
export const facebookLogin = () =>
  (window.location.href = "/api/v1/auth/facebook");

// ✅ Get logged-in user
export const getCurrentUser = () => api.get("/users/me");
