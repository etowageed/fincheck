// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send cookies for sessions if used
  //   timeout: 10000,
});

export default api;
