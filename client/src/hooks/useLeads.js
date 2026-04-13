/**
 * useLeads.js
 * Path: client/src/hooks/useLeads.js
 *
 * UPDATED IN PART 2 PHASE 3: Added pagination.
 * Keeps original optimistic updates for update/delete/status.
 * Create and delete refetch to keep pagination counts accurate.
 */

import { useState, useEffect, useCallback } from "react";
import { leadService } from "../services/leadService";

export const useLeads = (filters = {}) => {
  const [leads, setLeads]           = useState([]);
  const [summary, setSummary]       = useState({ total: 0, hot: 0, warm: 0, cold: 0 });
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 12,
    totalPages: 1, hasNextPage: false, hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.search, filters.sort]);

  // ─── Fetch leads ───────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadService.getLeads({ ...filters, page, limit: 12 });
      setLeads(data.leads);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ─── Create ────────────────────────────────────────────────────────────────
  const createLead = async (data) => {
    const result = await leadService.createLead(data);
    // Refetch to keep pagination count accurate
    await fetchLeads();
    return result;
  };

  // ─── Update (optimistic) ───────────────────────────────────────────────────
  const updateLead = async (id, data) => {
    const result = await leadService.updateLead(id, data);
    setLeads((prev) => prev.map((l) => (l._id === id ? result.lead : l)));
    return result;
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteLead = async (id) => {
    const lead = leads.find((l) => l._id === id);
    await leadService.deleteLead(id);
    // Optimistically remove from list
    setLeads((prev) => prev.filter((l) => l._id !== id));
    if (lead) {
      setSummary((prev) => ({
        ...prev,
        total: prev.total - 1,
        [lead.status.toLowerCase()]: prev[lead.status.toLowerCase()] - 1,
      }));
    }
    // If we deleted the last item on this page, go back one
    if (leads.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
  };

  // ─── Quick status update (optimistic) ─────────────────────────────────────
  const updateStatus = async (id, status) => {
    const result = await leadService.updateStatus(id, status);
    setLeads((prev) => prev.map((l) => (l._id === id ? result.lead : l)));
    return result;
  };

  // ─── Pagination controls ───────────────────────────────────────────────────
  const goToPage = (p) => setPage(Math.max(1, Math.min(p, pagination.totalPages)));
  const nextPage = () => pagination.hasNextPage && setPage((p) => p + 1);
  const prevPage = () => pagination.hasPrevPage && setPage((p) => p - 1);

  return {
    leads,
    summary,
    pagination,
    loading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    updateStatus,
  };
};