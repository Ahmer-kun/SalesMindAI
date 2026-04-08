/**
 * analyticsService.js
 * Path: client/src/services/analyticsService.js
 */

import api from "./api";

export const analyticsService = {
  /**
   * Fetch full dashboard analytics for the current user
   */
  getAnalytics: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },
};
