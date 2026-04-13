/**
 * Pure SVG chart components — no external chart library needed.
 * Includes: BarChart, LineChart, DonutChart
 */

import React from "react";

// Bar Chart
export const BarChart = ({ data = [], height = 120, color = "#6366f1" }) => {
  if (!data.length) return null;

  const max    = Math.max(...data.map((d) => d.count), 1);
  const w      = 600;
  const pad    = 8;
  const barW   = Math.max(2, (w - pad * 2) / data.length - 2);
  const gap    = (w - pad * 2 - barW * data.length) / Math.max(data.length - 1, 1);

  // only show ~6 labels evenly spaced so they don't crowd
  const labelStep = Math.ceil(data.length / 6);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 24}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH  = Math.max(2, (d.count / max) * height);
        const x     = pad + i * (barW + gap);
        const y     = height - barH;
        const showL = i % labelStep === 0 || i === data.length - 1;

        return (
          <g key={d.date}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx="2"
              fill={color}
              opacity={d.count === 0 ? 0.12 : 0.85}
            />
            {showL && (
              <text
                x={x + barW / 2} y={height + 16}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                opacity="0.45"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// line Chart
export const LineChart = ({ data = [], height = 120, color = "#6366f1" }) => {
  if (!data.length) return null;

  const max  = Math.max(...data.map((d) => d.count), 1);
  const w    = 600;
  const pad  = 12;
  const step = (w - pad * 2) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad + i * step,
    y: height - (d.count / max) * (height - 8),
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Filled area path
  const areaPath =
    `M ${points[0].x} ${height} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${height} Z`;

  const labelStep = Math.ceil(data.length / 6);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 24}`} className="overflow-visible">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Filled area */}
      <path d={areaPath} fill="url(#lineGrad)" />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots on non-zero points */}
      {points.map((p, i) =>
        p.count > 0 ? (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ) : null
      )}

      {/* X-axis labels */}
      {points.map((p, i) =>
        i % labelStep === 0 || i === points.length - 1 ? (
          <text
            key={i}
            x={p.x} y={height + 16}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            opacity="0.45"
          >
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
};

// donut chart
export const DonutChart = ({ segments = [], size = 120 }) => {
  const total  = segments.reduce((s, seg) => s + seg.value, 0);
  const r      = 42;
  const cx     = size / 2;
  const cy     = size / 2;
  const stroke = 14;

  if (total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fill="#9ca3af">0</text>
      </svg>
    );
  }

  let offset = 0;
  const circ  = 2 * Math.PI * r;

  return (
    <svg width={size} height={size}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />

      {segments.map((seg, i) => {
        const pct   = seg.value / total;
        const dash  = pct * circ;
        const gap   = circ - dash;
        const rot   = offset * 360 - 90;
        offset     += pct;

        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rot} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}

      {/* Center total */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9ca3af">
        LEADS
      </text>
    </svg>
  );
};
