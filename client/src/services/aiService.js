/**
 * aiService.js
 * Path: client/src/services/aiService.js
 *
 * Frontend service for all AI API calls.
 */

import api from "./api";

export const aiService = {
  /**
   * Generate personalized outreach email for a lead
   * @param {string} leadId
   * @param {string} productDescription
   */
  generateOutreach: async (leadId, productDescription) => {
    const response = await api.post("/ai/outreach", { leadId, productDescription });
    return response.data;
  },

  /**
   * Generate a follow-up message based on previous conversation
   * @param {string} leadId
   * @param {string} previousMessage
   * @param {string} followUpGoal
   */
  generateFollowUp: async (leadId, previousMessage, followUpGoal) => {
    const response = await api.post("/ai/followup", { leadId, previousMessage, followUpGoal });
    return response.data;
  },

  /**
   * Score a lead using AI (0–100)
   * @param {string} leadId
   */
  scoreLead: async (leadId) => {
    const response = await api.post("/ai/score", { leadId });
    return response.data;
  },

  /**
   * Get AI message history for a lead
   * @param {string} leadId
   */
  getHistory: async (leadId) => {
    const response = await api.get(`/ai/history/${leadId}`);
    return response.data;
  },
};