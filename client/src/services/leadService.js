/**
 * leadService.js
 * Path: client/src/services/leadService.js
 *
 * All API calls for lead management.
 */

import api from "./api";

export const leadService = {
  /**
   * Fetch all leads — supports filters
   * @param {{ status?, search?, sort? }} params
   */
  getLeads: async (params = {}) => {
    const response = await api.get("/leads", { params });
    return response.data;
  },

  /**
   * Fetch a single lead by ID
   */
  getLead: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * Create a new lead
   */
  createLead: async (data) => {
    const response = await api.post("/leads", data);
    return response.data;
  },

  /**
   * Update all fields of a lead
   */
  updateLead: async (id, data) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  /**
   * Delete a lead
   */
  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  /**
   * Quick status update (Hot / Warm / Cold)
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  },
};
