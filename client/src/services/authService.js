/**
 * authService.js
 * All API calls related to authentication.
 */

import api from "./api";

export const authService = {
  /**
   * Register a new user
   * @param {{ name, email, password }} data
   */
  signup: async (data) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  /**
   * Log in with email and password
   * @param {{ email, password }} data
   */
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  /**
   * Log out and clear session
   */
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Get the currently authenticated user's info
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Request a new access token using the refresh cookie
   */
  refresh: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};
