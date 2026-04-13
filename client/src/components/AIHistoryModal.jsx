/**
 * AIHistoryModal.jsx
 * Path: client/src/components/AIHistoryModal.jsx
 *
 * Modal that shows all AI-generated messages for a specific lead.
 * Fetches from GET /api/ai/history/:leadId
 * Shows outreach + follow-up messages with timestamps and copy buttons.
 */

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { aiService } from "../services/aiService";

// ─── Single message card ──────────────────────────────────────────────────────
const MessageCard = ({ msg }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeConfig = {
    outreach: {
      label: "Outreach email",
      color: "bg-brand-50 border-brand-200",
      badge: "bg-brand-100 text-brand-700",
      dot: "bg-brand-500",
    },
    followup: {
      label: "Follow-up",
      color: "bg-green-50 border-green-200",
      badge: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
  };

  const config = typeConfig[msg.type] || typeConfig.outreach;

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${config.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(msg.generatedAt)}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Message body */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    </div>
  );
};

// ─── AIHistoryModal ───────────────────────────────────────────────────────────
const AIHistoryModal = ({ lead, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all"); // "all" | "outreach" | "followup"

  useEffect(() => {
    if (!lead?._id) return;

    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await aiService.getHistory(lead._id);
        // Sort newest first
        const sorted = [...(data.aiMessages || [])].sort(
          (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
        );
        setMessages(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load AI history.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [lead?._id]);

  const filtered = filter === "all"
    ? messages
    : messages.filter((m) => m.type === filter);

  const outreachCount = messages.filter((m) => m.type === "outreach").length;
  const followupCount = messages.filter((m) => m.type === "followup").length;

  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title={`AI History — ${lead?.name || ""}`}
      maxWidth="max-w-2xl"
    >
      {/* Stats row */}
      <div className="flex gap-3 mb-4">
        {[
          { label: "All messages", value: messages.length, key: "all", color: "text-gray-700" },
          { label: "Outreach", value: outreachCount, key: "outreach", color: "text-brand-700" },
          { label: "Follow-ups", value: followupCount, key: "followup", color: "text-green-700" },
        ].map(({ label, value, key, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 px-3 py-2.5 rounded-xl border text-center transition-all duration-100 ${
              filter === key
                ? "bg-gray-900 border-gray-900 text-white"
                : "bg-surface-50 border-surface-200 hover:border-gray-300"
            }`}
          >
            <p className={`text-lg font-semibold ${filter === key ? "text-white" : color}`}>
              {value}
            </p>
            <p className={`text-xs ${filter === key ? "text-gray-300" : "text-gray-500"}`}>
              {label}
            </p>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading messages...</p>
          </div>
        </div>

      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500">{error}</p>
        </div>

      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {filter === "all" ? "No AI messages yet" : `No ${filter} messages yet`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Go to AI Tools to generate messages for this lead
          </p>
        </div>

      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map((msg, i) => (
            <MessageCard key={msg._id || i} msg={msg} />
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AIHistoryModal;
