/**
 * useLeads.js
 * Path: client/src/hooks/useLeads.js
 *
 * Custom hook for lead state management.
 * Handles fetch, create, update, delete with local optimistic updates.
 */

import { useState, useEffect, useCallback } from "react";
import { leadService } from "../services/leadService";

export const useLeads = (filters = {}) => {
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({ total: 0, hot: 0, warm: 0, cold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch leads ───────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadService.getLeads(filters);
      setLeads(data.leads);
      setSummary(data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ─── Create ────────────────────────────────────────────────────────────────
  const createLead = async (data) => {
    const result = await leadService.createLead(data);
    // Prepend new lead to top of list
    setLeads((prev) => [result.lead, ...prev]);
    setSummary((prev) => ({
      ...prev,
      total: prev.total + 1,
      [result.lead.status.toLowerCase()]: prev[result.lead.status.toLowerCase()] + 1,
    }));
    return result;
  };

  // ─── Update ────────────────────────────────────────────────────────────────
  const updateLead = async (id, data) => {
    const result = await leadService.updateLead(id, data);
    setLeads((prev) =>
      prev.map((l) => (l._id === id ? result.lead : l))
    );
    return result;
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteLead = async (id) => {
    const lead = leads.find((l) => l._id === id);
    await leadService.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l._id !== id));
    if (lead) {
      setSummary((prev) => ({
        ...prev,
        total: prev.total - 1,
        [lead.status.toLowerCase()]: prev[lead.status.toLowerCase()] - 1,
      }));
    }
  };

  // ─── Quick status update ───────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    const result = await leadService.updateStatus(id, status);
    setLeads((prev) => prev.map((l) => (l._id === id ? result.lead : l)));
    return result;
  };

  return {
    leads,
    summary,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    updateStatus,
  };
};
