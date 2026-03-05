import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  Zap,
  Clock,
  Users,
  Search,
  X,
  AlertTriangle,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useGetIssuesQuery } from "../../services/api";
import _ from "lodash";
import { useNavigate } from "react-router";
import moment from "moment";

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

const PRIORITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function EscalatedIssues() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: allIssues = [], isLoading, refetch } = useGetIssuesQuery();

  const escalatedIssues = allIssues.filter(
    (i: any) => i.status?.toLowerCase() === "escalated",
  );

  const filteredIssues = escalatedIssues
    .filter((issue: any) => {
      const matchesPriority =
        filterPriority === "all" || issue.priority === filterPriority;
      const matchesSearch =
        issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.createdBy?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        issue.assignedTo?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        issue._id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPriority && matchesSearch;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "priority")
        return (
          (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
        );
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const criticalCount = escalatedIssues.filter(
    (i: any) => i.priority === "Critical",
  ).length;
  const highCount = escalatedIssues.filter(
    (i: any) => i.priority === "High",
  ).length;
  const unassigned = escalatedIssues.filter((i: any) => !i.assignedTo).length;
  const over7Days = escalatedIssues.filter(
    (i: any) => moment().diff(moment(i.createdAt), "days") > 7,
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar role="admin" />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-slate-400 animate-pulse">
            Loading escalated issues...
          </div>
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
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Zap className="text-orange-400" size={22} />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Escalated Issues
              </h1>
              {escalatedIssues.length > 0 && (
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm font-semibold rounded-full animate-pulse">
                  {escalatedIssues.length} pending
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm md:text-base">
              Issues escalated by staff that require admin action
            </p>
          </motion.div>

          {/* Stats - CHANGED: 2 cols on mobile, 4 on md */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              {
                label: "Total Escalated",
                value: escalatedIssues.length,
                color: "text-orange-400",
                bg: "border-orange-500/20",
                icon: Zap,
              },
              {
                label: "Critical / High",
                value: criticalCount + highCount,
                color: "text-red-400",
                bg: "border-red-500/20",
                icon: AlertTriangle,
              },
              {
                label: "Unassigned",
                value: unassigned,
                color: "text-amber-400",
                bg: "border-amber-500/20",
                icon: Users,
              },
              {
                label: "Open > 7 Days",
                value: over7Days,
                color: "text-purple-400",
                bg: "border-purple-500/20",
                icon: Clock,
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <GlassCard className={`border ${s.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs">{s.label}</p>
                    <s.icon size={16} className={s.color} />
                  </div>
                  <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>
                    {s.value}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {escalatedIssues.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-28 text-slate-500"
            >
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Zap size={28} className="text-green-400" />
              </div>
              <p className="text-lg text-white font-medium mb-1">All clear!</p>
              <p className="text-sm">No escalated issues at the moment.</p>
            </motion.div>
          ) : (
            <>
              {/* Filters - CHANGED: stack on mobile */}
              <GlassCard className="mb-6">
                <div className="flex gap-2 md:gap-3 flex-wrap items-center">
                  <div className="w-full sm:flex-1 sm:min-w-48 relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, student or staff..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value="all">All Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">By Priority</option>
                  </select>

                  {(searchQuery || filterPriority !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterPriority("all");
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      <X size={14} /> Clear
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-3">
                  Showing {filteredIssues.length} of {escalatedIssues.length}{" "}
                  escalated issues
                </p>
              </GlassCard>

              {/* Issue Cards */}
              <div className="space-y-4">
                {filteredIssues.map((issue: any, idx: number) => {
                  const priColor = PRIORITY_COLORS[issue.priority] || "#94a3b8";
                  const daysOpen = moment().diff(
                    moment(issue.createdAt),
                    "days",
                  );
                  const isUrgent =
                    daysOpen > 7 || issue.priority === "Critical";

                  const escalationLog = [...(issue.workLogs || [])]
                    .reverse()
                    .find(
                      (l: any) =>
                        l.type === "escalation" ||
                        l.message?.toLowerCase().includes("escalat"),
                    );

                  return (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/admin/issues/${issue._id}`)}
                      className={`p-4 md:p-5 rounded-xl border cursor-pointer transition-all group ${isUrgent ? "bg-red-500/8 border-red-500/30 hover:border-red-500/50" : "bg-orange-500/8 border-orange-500/25 hover:border-orange-500/45"}`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div
                          className="mt-1 w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: priColor }}
                        />
                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                              <h3 className="text-white font-semibold text-sm md:text-base">
                                {issue.title}
                              </h3>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  background: `${priColor}20`,
                                  color: priColor,
                                }}
                              >
                                {issue.priority}
                              </span>
                              {daysOpen > 7 && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                                  ⚠ {daysOpen}d open
                                </span>
                              )}
                            </div>
                            {/* CTA - hidden on very small */}
                            <div className="shrink-0 hidden sm:flex flex-col items-end gap-1">
                              <span className="flex items-center gap-1 text-xs text-orange-400 font-medium group-hover:gap-2 transition-all">
                                Review <ChevronRight size={14} />
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                #{issue._id?.slice(0, 8)}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-400 text-sm line-clamp-1 mb-3">
                            {issue.description}
                          </p>

                          {escalationLog && (
                            <div className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                              <p className="text-xs text-orange-300 font-medium mb-0.5">
                                Escalation reason:
                              </p>
                              <p className="text-xs text-slate-300">
                                {escalationLog.message?.replace(
                                  /^escalated(?: to admin)?[:\s-]*/i,
                                  "",
                                ) || "No reason provided"}
                              </p>
                              {escalationLog.updatedBy?.name && (
                                <p className="text-xs text-slate-500 mt-1">
                                  — {escalationLog.updatedBy.name},{" "}
                                  {moment(escalationLog.createdAt).fromNow()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Meta row - CHANGED: wrap on mobile */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {issue.createdBy?.name ||
                                issue.studentName ||
                                "Unknown"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={10} />
                              {issue.assignedTo?.name || (
                                <span className="text-amber-400">
                                  Unassigned
                                </span>
                              )}
                            </span>
                            <span>{_.startCase(issue.category)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {moment(issue.createdAt).format("MMM DD, YYYY")}
                            </span>
                          </div>

                          {/* Mobile CTA */}
                          <div className="mt-2 flex justify-end sm:hidden">
                            <span className="text-xs text-orange-400 font-mono">
                              #{issue._id?.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
