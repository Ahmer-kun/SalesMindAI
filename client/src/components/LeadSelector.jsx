/**
 * Dropdown that fetches user's leads and lets them pick one.
 * Used inside AI Tools forms.
 */

import React, { useEffect, useState } from "react";
import { leadService } from "../services/leadService";

const LeadSelector = ({ value, onChange, placeholder = "Select a lead..." }) => {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadService
      .getLeads()
      .then((data) => setLeads(data.leads || []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">Lead</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
        disabled={loading}
      >
        <option value="">{loading ? "Loading leads..." : placeholder}</option>
        {leads.map((lead) => (
          <option key={lead._id} value={lead._id}>
            {lead.name} {lead.company ? `— ${lead.company}` : ""} [{lead.status}]
          </option>
        ))}
      </select>
      {!loading && leads.length === 0 && (
        <p className="text-xs text-gray-400">
          No leads yet.{" "}
          <a href="/leads" className="text-brand-600 hover:underline">
            Add a lead first →
          </a>
        </p>
      )}
    </div>
  );
};

export default LeadSelector;