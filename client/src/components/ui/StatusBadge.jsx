/**
 * Displays Hot / Warm / Cold with color coding.
 */

import React from "react";

const config = {
  Hot:  { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500",    border: "border-red-200" },
  Warm: { bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-500",  border: "border-amber-200" },
  Cold: { bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-400",   border: "border-blue-200" },
};

const StatusBadge = ({ status, size = "sm" }) => {
  const c = config[status] || config.Cold;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
