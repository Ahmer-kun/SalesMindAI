/**
 * Renders the AI lead score result with a score bar,
 * label, reasoning, strengths and concerns.
 */

import React from "react";
import StatusBadge from "./ui/StatusBadge";

const ScoreDisplay = ({ score, label, reasoning, strengths = [], concerns = [] }) => {
  const color =
    score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-blue-400";

  const trackColor =
    score >= 70 ? "bg-red-100" : score >= 40 ? "bg-amber-100" : "bg-blue-100";

  return (
    <div className="mt-4 card overflow-hidden">
      {/* score header */}
      <div className="px-5 py-4 border-b border-surface-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">AI Lead Score</span>
          <StatusBadge status={label} />
        </div>

        {/* score bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-semibold text-gray-900">{score}</span>
            <span className="text-xs text-gray-400 mb-1">out of 100</span>
          </div>
          <div className={`w-full h-2 rounded-full ${trackColor}`}>
            <div
              className={`h-2 rounded-full transition-all duration-700 ${color}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* reasoning */}
      {reasoning && (
        <div className="px-5 py-3 border-b border-surface-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Analysis
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* strengths & concerns */}
      {(strengths.length > 0 || concerns.length > 0) && (
        <div className="px-5 py-3 grid grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">
                Strengths
              </p>
              <ul className="space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {concerns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
                Concerns
              </p>
              <ul className="space-y-1">
                {concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;