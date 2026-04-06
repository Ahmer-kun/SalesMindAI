/**
 * LeadCard.jsx
 * Path: client/src/components/LeadCard.jsx
 *
 * Displays a single lead in the leads list.
 * Shows name, company, email, status badge, and action buttons.
 */

import React, { useState } from "react";
import StatusBadge from "./ui/StatusBadge";

const LeadCard = ({ lead, onEdit, onDelete, onStatusChange }) => {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete(lead._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const initials = lead.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarColors = {
    Hot:  "bg-red-100 text-red-700",
    Warm: "bg-amber-100 text-amber-700",
    Cold: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="card p-4 hover:shadow-card-hover transition-shadow duration-150 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
            avatarColors[lead.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
              {lead.company && (
                <p className="text-xs text-gray-500 truncate">{lead.company}</p>
              )}
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <p className="text-xs text-gray-400 mt-1 truncate">{lead.email}</p>

          {lead.notes && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {lead.notes}
            </p>
          )}

          {/* Score pill (shown if scored in Phase 4) */}
          {lead.score !== null && lead.score !== undefined && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-500">
                Score:{" "}
                <span
                  className={`font-semibold ${
                    lead.score >= 70
                      ? "text-green-600"
                      : lead.score >= 40
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {lead.score}/100
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-100">
        {/* Quick status buttons */}
        <div className="flex gap-1 flex-1">
          {["Hot", "Warm", "Cold"].map((s) => (
            <button
              key={s}
              onClick={() => lead.status !== s && onStatusChange(lead._id, s)}
              className={`text-xs px-2 py-1 rounded-lg transition-all duration-100 font-medium ${
                lead.status === s
                  ? "bg-surface-100 text-gray-600 cursor-default"
                  : "text-gray-400 hover:bg-surface-100 hover:text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Edit */}
        <button
          onClick={() => onEdit(lead)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all duration-100"
          title="Edit lead"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`p-1.5 rounded-lg transition-all duration-100 ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
          title={confirmDelete ? "Click again to confirm" : "Delete lead"}
          onBlur={() => setConfirmDelete(false)}
        >
          {deleting ? (
            <span className="w-3.5 h-3.5 block rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
