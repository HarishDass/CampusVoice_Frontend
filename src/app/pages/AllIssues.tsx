import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useGetAssignedGrievancesQuery } from "../../services/api";
import _ from "lodash";
import { useNavigate } from "react-router";

export default function AllIssues() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: issues = [], isLoading } = useGetAssignedGrievancesQuery();

  const filteredIssues = issues.filter((issue: any) => {
    const matchesStatus =
      filterStatus === "all" || issue.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || issue.priority === filterPriority;
    const matchesCategory =
      filterCategory === "all" ||
      issue.category?.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue._id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const STATUS_COLORS: Record<string, string> = {
    resolved: "#10b981",
    open: "#f59e0b",
    in_progress: "#3b82f6",
    escalated: "#f97316",
    on_hold: "#8b5cf6",
    closed: "#64748b",
    pending: "#94a3b8",
    denied: "#dc2626",
  };

  const PRIORITY_COLORS: Record<string, string> = {
    Critical: "#dc2626",
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || "#6b7280";
  const getPriorityColor = (priority: string) =>
    PRIORITY_COLORS[priority] || "#ffffff";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return CheckCircle2;
      case "open":
        return Clock;
      default:
        return TrendingUp;
    }
  };

  const stats = {
    total: issues.length,
    open: issues.filter((i: any) => i.status === "open").length,
    resolved: issues.filter((i: any) => i.status === "resolved").length,
    high: issues.filter((i: any) => i.priority === "High").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading issues...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar role="staff" />

      {/* CHANGED: md:ml-64 */}
      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        {/* CHANGED: p-4 on mobile */}
        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">
            All Issues
          </h1>
          <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">
            Comprehensive view of all grievances in the system
          </p>

          {/* Stats - CHANGED: 2 cols on mobile, 4 on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <GlassCard>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-xl md:text-2xl text-white font-bold">
                {stats.total}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-slate-400 text-sm">Open</p>
              <p className="text-xl md:text-2xl text-yellow-400 font-bold">
                {stats.open}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-slate-400 text-sm">Resolved</p>
              <p className="text-xl md:text-2xl text-green-400 font-bold">
                {stats.resolved}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-slate-400 text-sm">High Priority</p>
              <p className="text-xl md:text-2xl text-red-400 font-bold">
                {stats.high}
              </p>
            </GlassCard>
          </div>

          {/* Filters - CHANGED: wrap on mobile */}
          <GlassCard className="mb-6">
            <div className="flex gap-2 md:gap-4 flex-wrap">
              <div className="w-full sm:flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search issue..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap flex-1 sm:flex-none">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-4 py-2 text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="academics">Academics</option>
                  <option value="facilities">Facilities</option>
                  <option value="Hostel & Facilities">Hostel</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-4 py-2 text-white text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-4 py-2 text-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Issues */}
          <div className="space-y-3 md:space-y-4">
            {filteredIssues.map((issue: any) => {
              const StatusIcon = getStatusIcon(issue.status);
              const statusColor = getStatusColor(issue.status);
              const priorityColor = getPriorityColor(issue.priority);

              return (
                <GlassCard key={issue._id} hover>
                  <div
                    className="flex items-start gap-3 md:gap-6 cursor-pointer"
                    onClick={() =>
                      navigate(`/staff/issues/details/${issue?._id}`)
                    }
                  >
                    <StatusIcon
                      size={22}
                      style={{ color: statusColor }}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      {/* CHANGED: wrap badges on mobile */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-semibold text-sm md:text-base">
                          {issue.title}
                        </h3>
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {_.startCase(issue.status)}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: `${priorityColor}20`,
                            color: priorityColor,
                          }}
                        >
                          {_.startCase(issue.priority)}
                        </span>
                      </div>

                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-blue-400 font-mono">
                          ID: {issue._id?.slice(0, 12)}...
                        </p>
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {_.startCase(issue?.category)}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-400 shrink-0 hidden md:block">
                      {_.startCase(issue?.category)}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
