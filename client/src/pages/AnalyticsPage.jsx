/**
 * AnalyticsPage.jsx
 *  - summary stat cards
 *  - Leads over time (bar chart)
 *  - Pipeline donut chart
 *  - Top scored leads
 *  - AI usage stats
 */

import React, { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { BarChart, LineChart, DonutChart } from "../components/MiniChart";
import StatusBadge from "../components/ui/StatusBadge";

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon }) => (
  <div className="card px-5 py-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <span className="text-xl opacity-60">{icon}</span>
    </div>
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div>
    <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`bg-surface-200 animate-pulse rounded-xl ${className}`} />
);

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const color =
    score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-blue-400";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-surface-200">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{score}</span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const { data, loading, error } = useAnalytics();
  const [chartType, setChartType] = useState("bar"); // "bar" | "line"

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const { summary, dailyData, scoredLeads, recentLeads } = data || {};

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your pipeline at a glance — last 30 days.
        </p>
      </div>

      {/* ── Summary stats ── */}
      <Section title="Overview">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total leads"
              value={summary?.totalLeads}
              icon="👥"
            />
            <StatCard
              label="Hot leads"
              value={summary?.byStatus?.Hot}
              sub={`${summary?.totalLeads ? Math.round((summary.byStatus.Hot / summary.totalLeads) * 100) : 0}% of pipeline`}
              icon="🔥"
            />
            <StatCard
              label="Avg lead score"
              value={summary?.avgScore !== null ? `${summary?.avgScore}/100` : "Not scored"}
              sub="Across scored leads"
              icon="📊"
            />
            <StatCard
              label="AI messages sent"
              value={summary?.aiUsage?.total}
              sub={`${summary?.aiUsage?.outreach} outreach · ${summary?.aiUsage?.followup} follow-ups`}
              icon="✨"
            />
          </div>
        )}
      </Section>

      {/* ── Leads over time ── */}
      <Section title="Leads added — last 30 days">
        <div className="card p-5">
          {/* Chart type toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">
              {loading ? "Loading..." : `${dailyData?.reduce((s, d) => s + d.count, 0) || 0} leads added`}
            </p>
            <div className="flex gap-1 p-0.5 bg-surface-100 rounded-lg">
              {["bar", "line"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    chartType === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "bar" ? "Bar" : "Line"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : dailyData?.length ? (
            <div className="text-gray-900">
              {chartType === "bar" ? (
                <BarChart data={dailyData} height={110} color="#6366f1" />
              ) : (
                <LineChart data={dailyData} height={110} color="#6366f1" />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          )}
        </div>
      </Section>

      {/* ── Pipeline + scored leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Donut + breakdown */}
        <Section title="Pipeline breakdown">
          <div className="card p-5">
            {loading ? (
              <Skeleton className="h-40" />
            ) : (
              <div className="flex items-center gap-6">
                <DonutChart
                  size={120}
                  segments={[
                    { value: summary?.byStatus?.Hot  || 0, color: "#ef4444" },
                    { value: summary?.byStatus?.Warm || 0, color: "#f59e0b" },
                    { value: summary?.byStatus?.Cold || 0, color: "#60a5fa" },
                  ]}
                />
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Hot",  value: summary?.byStatus?.Hot,  color: "bg-red-500" },
                    { label: "Warm", value: summary?.byStatus?.Warm, color: "bg-amber-500" },
                    { label: "Cold", value: summary?.byStatus?.Cold, color: "bg-blue-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                      <span className="text-sm text-gray-600 flex-1">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">{value}</span>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {summary?.totalLeads
                          ? `${Math.round((value / summary.totalLeads) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Top scored leads */}
        <Section title="Top scored leads">
          <div className="card divide-y divide-surface-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : scoredLeads?.length ? (
              scoredLeads.map((lead) => (
                <div key={lead._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  </div>
                  <ScoreBar score={lead.score} />
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">No scored leads yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Use AI Tools → Score lead to generate scores.
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* ── Recent activity ── */}
      <Section title="Recent activity">
        <div className="card divide-y divide-surface-100">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            ))
          ) : recentLeads?.length ? (
            recentLeads.map((lead) => {
              const initials = lead.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              const avatarColors = {
                Hot:  "bg-red-100 text-red-700",
                Warm: "bg-amber-100 text-amber-700",
                Cold: "bg-blue-100 text-blue-700",
              };
              const timeAgo = (date) => {
                const s = Math.floor((Date.now() - new Date(date)) / 1000);
                if (s < 60)  return "just now";
                if (s < 3600) return `${Math.floor(s / 60)}m ago`;
                if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
                return `${Math.floor(s / 86400)}d ago`;
              };
              return (
                <div key={lead._id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[lead.status]}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-400">{lead.company || "No company"} · Added {timeAgo(lead.createdAt)}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">No activity yet. Add your first lead to get started.</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default AnalyticsPage;

// /**
//  * AnalyticsPage.jsx
//  * Path: client/src/pages/AnalyticsPage.jsx
//  * Placeholder — will be built in Phase 5.
//  */

// import React from "react";

// const AnalyticsPage = () => (
//   <div className="p-6 max-w-4xl mx-auto page-enter">
//     <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Analytics</h1>
//     <p className="text-sm text-gray-500">Pipeline analytics and activity tracking — coming in Phase 5.</p>
//     <div className="card mt-6 p-10 flex flex-col items-center text-center gap-3">
//       <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center text-2xl">📊</div>
//       <p className="text-sm font-medium text-gray-900">Analytics unlock in Phase 5</p>
//       <p className="text-xs text-gray-400 max-w-xs">Track conversion rates, lead activity, and pipeline health over time.</p>
//     </div>
//   </div>
// );

// export default AnalyticsPage;
