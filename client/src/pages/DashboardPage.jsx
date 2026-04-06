/**
 * DashboardPage.jsx
 * Path: client/src/pages/DashboardPage.jsx
 *
 * UPDATED IN PHASE 2:
 * Shows real lead summary counts + recent leads list.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLeads } from "../hooks/useLeads";
import StatusBadge from "../components/ui/StatusBadge";
import { Button } from "../components/ui";

const StatCard = ({ label, value, color, to }) => (
  <Link to={to || "#"} className="card px-5 py-4 hover:shadow-card-hover transition-shadow duration-150 block">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${color}`} />
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { leads, summary, loading } = useLeads({ sort: "newest" });
  const recentLeads = leads.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening in your pipeline today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card px-5 py-4 animate-pulse">
              <div className="h-7 w-12 bg-surface-200 rounded mb-2" />
              <div className="h-4 w-20 bg-surface-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          <StatCard label="Total leads" value={summary.total} color="bg-gray-400" to="/leads" />
          <StatCard label="Hot leads" value={summary.hot} color="bg-red-500" to="/leads" />
          <StatCard label="Warm leads" value={summary.warm} color="bg-amber-500" to="/leads" />
          <StatCard label="Cold leads" value={summary.cold} color="bg-blue-400" to="/leads" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Recent leads</h2>
            <Link to="/leads" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">View all →</Link>
          </div>
          <div className="card divide-y divide-surface-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-surface-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-surface-200 rounded" />
                    <div className="h-3 w-24 bg-surface-100 rounded" />
                  </div>
                  <div className="h-5 w-12 bg-surface-100 rounded-full" />
                </div>
              ))
            ) : recentLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No leads yet.</p>
                <Link to="/leads"><Button className="mt-3 text-xs">Add your first lead</Button></Link>
              </div>
            ) : (
              recentLeads.map((lead) => {
                const initials = lead.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                const avatarColors = { Hot: "bg-red-100 text-red-700", Warm: "bg-amber-100 text-amber-700", Cold: "bg-blue-100 text-blue-700" };
                return (
                  <div key={lead._id} className="flex items-center gap-3 p-4">
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
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add a new lead", to: "/leads", icon: "➕" },
              { label: "Generate outreach message", to: "/ai-tools", icon: "✉️", soon: true },
              { label: "Score your leads", to: "/ai-tools", icon: "📊", soon: true },
              { label: "View analytics", to: "/analytics", icon: "📈", soon: true },
            ].map(({ label, to, icon, soon }) => (
              <Link key={label} to={to} className="card px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-150 block">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-gray-700 flex-1">{label}</span>
                {soon && <span className="text-xs bg-surface-100 text-gray-400 px-2 py-0.5 rounded-full">Soon</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;