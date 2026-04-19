/**
 * pulls data from the analytics endpoint instead of the leads endpoint directly.
 * shows summary cards, recent leads, mini pipeline chart, and quick actions.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../hooks/useAnalytics";
import StatusBadge from "../components/ui/StatusBadge";
import { BarChart } from "../components/MiniChart";
import { Button } from "../components/ui";

const Skeleton = ({ className = "" }) => (
  <div className={`bg-surface-200 animate-pulse rounded-xl ${className}`} />
);

const StatCard = ({ label, value, color, to }) => (
  <Link to={to || "#"} className="card px-5 py-4 hover:shadow-card-hover transition-shadow duration-150 block">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading } = useAnalytics();

  const { summary, recentLeads, dailyData } = data || {};

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening in your pipeline today.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          <StatCard label="Total leads"  value={summary?.totalLeads}      color="bg-gray-400"  to="/leads" />
          <StatCard label="Hot leads"    value={summary?.byStatus?.Hot}   color="bg-red-500"   to="/leads" />
          <StatCard label="Warm leads"   value={summary?.byStatus?.Warm}  color="bg-amber-500" to="/leads" />
          <StatCard label="Cold leads"   value={summary?.byStatus?.Cold}  color="bg-blue-400"  to="/leads" />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: recent leads + mini chart */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mini chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Leads this month</h2>
              <Link to="/analytics" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Full analytics →
              </Link>
            </div>
            <div className="card p-4">
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="text-gray-900">
                  <BarChart data={dailyData || []} height={80} color="#6366f1" />
                </div>
              )}
            </div>
          </div>

          {/* Recent leads */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent leads</h2>
              <Link to="/leads" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="card divide-y divide-surface-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
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
                    Hot: "bg-red-100 text-red-700",
                    Warm: "bg-amber-100 text-amber-700",
                    Cold: "bg-blue-100 text-blue-700",
                  };
                  return (
                    <div key={lead._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[lead.status]}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400 truncate">{lead.company || lead.email}</p>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No leads yet.</p>
                  <Link to="/leads">
                    <Button className="mt-3 text-xs">Add your first lead</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: quick actions + AI usage */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h2>
            <div className="space-y-2">
              {[
                { label: "Add a new lead",          to: "/leads",    icon: "➕" },
                { label: "Generate outreach email", to: "/ai-tools", icon: "✉️" },
                { label: "Score a lead",            to: "/ai-tools", icon: "📊" },
                { label: "View full analytics",     to: "/analytics", icon: "📈" },
              ].map(({ label, to, icon }) => (
                <Link key={label} to={to}
                  className="card px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-150 block">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* AI usage mini stats */}
          {!loading && summary?.aiUsage?.total > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">AI usage</h2>
              <div className="card px-4 py-4 space-y-3">
                {[
                  { label: "Outreach emails",   value: summary.aiUsage.outreach, color: "bg-brand-500" },
                  { label: "Follow-ups",        value: summary.aiUsage.followup, color: "bg-indigo-400" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                    <div className="h-1.5 bg-surface-200 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${Math.min(100, (value / Math.max(summary.aiUsage.total, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-1">
                  {summary.aiUsage.total} total AI messages generated
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
