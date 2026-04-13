/**
 * userService.js
 * Path: client/src/services/userService.js
 */

import api from "./api";

export const userService = {
  /**
   * Update name and/or email
   */
  updateProfile: async (data) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data) => {
    const response = await api.put("/user/password", data);
    return response.data;
  },

  /**
   * Permanently delete account and all data
   */
  deleteAccount: async (password) => {
    const response = await api.delete("/user", { data: { password } });
    return response.data;
  },
};
