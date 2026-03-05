import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  Search,
  Zap,
  Users,
  Filter,
  X,
} from "lucide-react";
import { useState } from "react";
import { useGetIssuesQuery } from "../../services/api";
import _ from "lodash";
import { useNavigate } from "react-router";
import moment from "moment";

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return CheckCircle2;
    case "escalated":
      return Zap;
    case "open":
      return Clock;
    default:
      return TrendingUp;
  }
};

function normalizeStatus(s: string) {
  return s?.toLowerCase().replace(/\s+/g, "_") || "open";
}

export default function AdminAllIssues() {
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: issues = [], isLoading } = useGetIssuesQuery();

  const uniqueCategories: string[] = Array.from(
    new Set(issues.map((i: any) => i.category?.toLowerCase()).filter(Boolean)),
  );

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
      issue._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.createdBy?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      issue.assignedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const stats = {
    total: issues.length,
    open: issues.filter((i: any) => i.status === "open").length,
    inProgress: issues.filter((i: any) => i.status === "in_progress").length,
    resolved: issues.filter((i: any) => i.status === "resolved").length,
    escalated: issues.filter((i: any) => i.status === "escalated").length,
    high: issues.filter(
      (i: any) => i.priority === "High" || i.priority === "Critical",
    ).length,
  };

  const hasActiveFilters =
    filterStatus !== "all" ||
    filterPriority !== "all" ||
    filterCategory !== "all" ||
    searchQuery !== "";

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterCategory("all");
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar role="admin" />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-slate-400 animate-pulse">Loading issues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />

      {/* CHANGED: md:ml-64 */}
      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        <div
          className="fixed inset-0 md:ml-64 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* CHANGED: p-4 on mobile */}
        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">
              All Issues
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Complete view of every grievance in the system
            </p>
          </motion.div>

          {/* Stats - CHANGED: 3 cols on mobile, 6 on md */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-6 md:mb-8">
            {[
              { label: "Total", value: stats.total, color: "text-white" },
              { label: "Open", value: stats.open, color: "text-amber-400" },
              {
                label: "In Progress",
                value: stats.inProgress,
                color: "text-blue-400",
              },
              {
                label: "Resolved",
                value: stats.resolved,
                color: "text-green-400",
              },
              {
                label: "Escalated",
                value: stats.escalated,
                color: "text-orange-400",
              },
              {
                label: "High/Critical",
                value: stats.high,
                color: "text-red-400",
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard>
                  <p className="text-slate-400 text-xs mb-1 truncate">
                    {s.label}
                  </p>
                  <p className={`text-xl md:text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Filters - CHANGED: wrap on mobile */}
          <GlassCard className="mb-6">
            <div className="flex gap-2 md:gap-3 flex-wrap items-center">
              {/* Search - full width on mobile */}
              <div className="w-full md:flex-1 md:min-w-48 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, ID, student or staff..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 flex-wrap flex-1">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {_.startCase(cat)}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                  <option value="denied">Denied</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-500 text-xs mt-3">
              Showing {filteredIssues.length} of {issues.length} issues
              {hasActiveFilters && " (filtered)"}
            </p>
          </GlassCard>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Filter size={36} className="mx-auto mb-3 opacity-30" />
                <p>No issues match your filters.</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-blue-400 text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredIssues.map((issue: any, idx: number) => {
                const StatusIcon = getStatusIcon(issue.status);
                const statusColor =
                  STATUS_COLORS[normalizeStatus(issue.status)] || "#94a3b8";
                const priColor = PRIORITY_COLORS[issue.priority] || "#ffffff";
                const isEscalated =
                  normalizeStatus(issue.status) === "escalated";

                return (
                  <motion.div
                    key={issue._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/admin/issues/${issue._id}`)}
                    className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${isEscalated ? "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50" : "bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/50 hover:border-slate-600"}`}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="mt-0.5 shrink-0">
                        <StatusIcon size={20} style={{ color: statusColor }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-semibold text-sm">
                            {issue.title}
                          </h3>
                          {isEscalated && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                              <Zap size={10} /> Escalated
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 text-xs line-clamp-1 mb-2">
                          {issue.description}
                        </p>

                        <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs text-slate-500">
                          <span>
                            {issue.createdBy?.name ||
                              issue.studentName ||
                              "Student"}
                          </span>
                          {issue.assignedTo && (
                            <span className="flex items-center gap-1">
                              <Users size={10} />
                              {issue.assignedTo.name}
                            </span>
                          )}
                          <span className="hidden sm:inline">
                            {_.startCase(issue.category)}
                          </span>
                          <span>{moment(issue.createdAt).fromNow()}</span>
                          {moment().diff(moment(issue.createdAt), "days") > 7 &&
                            !["resolved", "closed"].includes(
                              normalizeStatus(issue.status),
                            ) && (
                              <span className="text-amber-500">
                                ⚠{" "}
                                {moment().diff(moment(issue.createdAt), "days")}
                                d
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Right badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {_.startCase(issue.status)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: `${priColor}20`,
                            color: priColor,
                          }}
                        >
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
