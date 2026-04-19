/**
 * full filter/search/sort, create/edit modals, empty states, error state.
 */

import React, { useState, useCallback } from "react";
import { useLeads } from "../hooks/useLeads";
import { useToast } from "../context/ToastContext";
import LeadCard from "../components/LeadCard";
import LeadForm from "../components/LeadForm";
import Modal from "../components/ui/Modal";
import { Button } from "../components/ui";
import StatusBadge from "../components/ui/StatusBadge";

// stat card component for summary row at top of leads page
const StatCard = ({ label, value, color }) => (
  <div className="card px-4 py-3 flex items-center gap-3">
    <div className={`w-2 h-8 rounded-full flex-shrink-0 ${color}`} />
    <div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// pagination component with prev/next buttons, page numbers, and total count

const Pagination = ({ pagination, page, onPrev, onNext, onGoTo }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { totalPages, hasNextPage, hasPrevPage, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page number range — max 5 pages around current
  let start = Math.max(1, page - 2);
  let end   = Math.min(totalPages, page + 2);
  if (end - start < 4) {
    if (start === 1) end   = Math.min(totalPages, start + 4);
    else             start = Math.max(1, end - 4);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-surface-200">
      <p className="text-xs text-gray-400 order-2 sm:order-1">
        Showing {from}–{to} of {total} leads
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-surface-300 text-gray-500 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* First page + ellipsis */}
        {start > 1 && (
          <>
            <button onClick={() => onGoTo(1)}
              className="w-8 h-8 rounded-lg text-xs font-medium text-gray-600 hover:bg-surface-100 transition-all">
              1
            </button>
            {start > 2 && <span className="text-gray-400 text-xs px-1">...</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map((p) => (
          <button key={p} onClick={() => onGoTo(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
              p === page ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-surface-100"
            }`}>
            {p}
          </button>
        ))}

        {/* Last page + ellipsis */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-400 text-xs px-1">...</span>}
            <button onClick={() => onGoTo(totalPages)}
              className="w-8 h-8 rounded-lg text-xs font-medium text-gray-600 hover:bg-surface-100 transition-all">
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-surface-300 text-gray-500 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// leadspage
const LeadsPage = () => {
  const [filters, setFilters]       = useState({ status: "", search: "", sort: "newest" });
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead]     = useState(null);

  const { toast } = useToast();

  const {
    leads,
    summary,
    pagination,
    loading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    createLead,
    updateLead,
    deleteLead,
    updateStatus,
  } = useLeads(filters);

  // handlers

  const handleCreate = async (data) => {
    try {
      await createLead(data);
      setCreateOpen(false);
      toast.success(`${data.name} added to your leads.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lead.");
      throw err; // re-throw so LeadForm can show inline error
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateLead(editLead._id, data);
      setEditLead(null);
      toast.success("Lead updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update lead.");
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      const lead = leads.find((l) => l._id === id);
      await deleteLead(id);
      toast.info(`${lead?.name || "Lead"} removed.`);
    } catch {
      toast.error("Failed to delete lead.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const lead = leads.find((l) => l._id === id);
      await updateStatus(id, status);
      toast.success(`${lead?.name || "Lead"} marked as ${status}.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
    }));
  };

  const handleSearch = useCallback(
    (e) => setFilters((prev) => ({ ...prev, search: e.target.value })),
    []
  );

  const handleSort = (e) =>
    setFilters((prev) => ({ ...prev, sort: e.target.value }));

  const clearStatusFilter = () =>
    setFilters((prev) => ({ ...prev, status: "" }));

  // render 
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto page-enter">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track your sales pipeline
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="sm:w-auto w-full">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add lead
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total leads" value={summary.total} color="bg-gray-400" />
        <StatCard label="Hot"         value={summary.hot}   color="bg-red-500" />
        <StatCard label="Warm"        value={summary.warm}  color="bg-amber-500" />
        <StatCard label="Cold"        value={summary.cold}  color="bg-blue-400" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            className="input-base pl-9"
            placeholder="Search by name, email, or company..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {["Hot", "Warm", "Cold"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-100 ${
                filters.status === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-surface-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
          {filters.status && (
            <button
              onClick={clearStatusFilter}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={filters.sort}
          onChange={handleSort}
          className="input-base w-auto"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* ── Content states ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading leads...</p>
          </div>
        </div>

      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-brand-600 hover:underline"
          >
            Try again
          </button>
        </div>

      ) : leads.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? "No leads match your filters"
                : "No leads yet"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {filters.search || filters.status
                ? "Try adjusting your search or filter"
                : "Add your first lead to get started"}
            </p>
          </div>
          {!filters.search && !filters.status && (
            <Button onClick={() => setCreateOpen(true)} className="mt-2">
              Add your first lead
            </Button>
          )}
        </div>

      ) : (
        <>
          {/* Result count + active filter indicator */}
          <p className="text-xs text-gray-400 mb-3">
            {pagination?.total ?? leads.length} lead{(pagination?.total ?? leads.length) !== 1 ? "s" : ""}
            {filters.status && ` · filtered by ${filters.status}`}
            {filters.search && ` matching "${filters.search}"`}
          </p>

          {/* Lead cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onEdit={setEditLead}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* ── Pagination ── */}
          <Pagination
            pagination={pagination}
            page={page}
            onPrev={prevPage}
            onNext={nextPage}
            onGoTo={goToPage}
          />
        </>
      )}

      {/* ── Create Modal ── */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add new lead"
      >
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create lead"
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editLead}
        onClose={() => setEditLead(null)}
        title="Edit lead"
      >
        {editLead && (
          <LeadForm
            initialData={editLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditLead(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </div>
  );
};

export default LeadsPage;