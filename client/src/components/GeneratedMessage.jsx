/**
 * Displays the AI-generated message with copy-to-clipboard and
 * a subtle typewriter reveal animation.
 */

import React, { useState } from "react";

const GeneratedMessage = ({ message, type }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labels = { outreach: "Outreach email", followup: "Follow-up message" };

  return (
    <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-200/60 bg-brand-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          <span className="text-xs font-medium text-brand-700">
            {labels[type] || "AI generated"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-white border border-brand-200 text-brand-600 hover:bg-brand-50"
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
      <div className="px-4 py-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
          {message}
        </p>
      </div>
    </div>
  );
};

export default GeneratedMessage;