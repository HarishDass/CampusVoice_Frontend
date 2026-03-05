import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useGetIssuesQuery } from "../../services/api";
import { useNavigate } from "react-router";
import _ from "lodash";

export default function TrackStatus() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data } = useGetIssuesQuery();
  const issues = data || [];

  const activeGrievances = issues.map((issue: any) => ({
    id: issue._id,
    title: issue.title,
    status: issue.status,
    progress: issue.progress || 0,
    category: issue.category,
    date: new Date(issue.createdAt).toLocaleDateString(),
    priority: issue.priority,
    estimatedResolution: issue.resolution || "Pending",
    assignedTeam: issue.assignedTo?.name || "Not Assigned",
    lastUpdate: new Date(issue.updatedAt).toLocaleDateString(),
  }));

  const filteredGrievances = activeGrievances.filter((g) => {
    const matchesStatus =
      filterStatus === "all" ||
      g.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const progresses =
    activeGrievances.length > 0
      ? Math.round(
          activeGrievances.reduce((acc, cur) => acc + (cur.progress || 0), 0) /
            activeGrievances.length,
        )
      : 0;
  const inProgressCount = activeGrievances.filter(
    (g) => g.status === "in_progress",
  ).length;
  const pendingCount = activeGrievances.filter(
    (g) => g.status === "open",
  ).length;

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

  const getStatusColor = (status: string) => STATUS_COLORS[status] || "#6b7280";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return Clock;
      case "In Progress":
        return TrendingUp;
      case "Resolved":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar role="citizen" />

      {/* CHANGED: md:ml-64 */}
      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        <div
          className="fixed inset-0 md:ml-64 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
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
              Active Grievances
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Monitor real-time progress of your ongoing issues
            </p>
          </motion.div>

          {/* Stats Cards - CHANGED: 3 cols on all, responsive sizing */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm mb-1">
                      In Progress
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">
                      {inProgressCount}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="text-blue-400" size={20} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm mb-1">
                      Pending
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-amber-400">
                      {pendingCount}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 bg-amber-500/20 rounded-lg">
                    <Clock className="text-amber-400" size={20} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm mb-1">
                      Avg. Progress
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      {progresses}%
                    </p>
                  </div>
                  <div className="p-2 md:p-3 bg-slate-700/50 rounded-lg">
                    <TrendingUp className="text-slate-300" size={20} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Filters - CHANGED: stack on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <GlassCard>
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                <div className="w-full md:flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by ID or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={16} className="text-slate-400 shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 md:flex-none bg-slate-800/50 border border-slate-700 rounded-lg px-3 md:px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Grievances - CHANGED: responsive card layout */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredGrievances.length > 0 ? (
              filteredGrievances.map((grievance, index) => {
                const StatusIcon = getStatusIcon(grievance.status);
                const statusColor = getStatusColor(grievance.status);

                return (
                  <motion.div
                    key={grievance.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() =>
                      navigate(`/student/track/details/${grievance?.id}`)
                    }
                  >
                    <GlassCard hover>
                      {/* CHANGED: stacked on mobile, 12-col grid on sm+ */}
                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6">
                        {/* Left: Main Info */}
                        <div className="sm:col-span-7">
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="p-2.5 rounded-lg bg-slate-800/50 shrink-0">
                              <StatusIcon
                                size={22}
                                style={{ color: statusColor }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                <h3 className="text-base md:text-xl font-semibold text-white">
                                  {grievance.title}
                                </h3>
                                <span
                                  className="px-2 md:px-3 py-1 rounded-full text-xs font-medium shrink-0"
                                  style={{
                                    background: `${statusColor}20`,
                                    color: statusColor,
                                    border: `1px solid ${statusColor}40`,
                                  }}
                                >
                                  {_.startCase(grievance.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400 mb-3 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {grievance.date}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${grievance.priority === "High" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
                                >
                                  {grievance.priority} Priority
                                </span>
                              </div>
                              <div className="space-y-1.5 text-xs md:text-sm">
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Assigned to:</span>
                                  <span className="text-white">
                                    {grievance.assignedTeam}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Last Update:</span>
                                  <span className="text-blue-400">
                                    {grievance.lastUpdate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Progress & ID */}
                        <div className="sm:col-span-5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Progress</span>
                              <span
                                style={{ color: statusColor }}
                                className="font-semibold"
                              >
                                {grievance.progress}%
                              </span>
                            </div>
                            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden mb-4">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${grievance.progress}%` }}
                                transition={{
                                  duration: 1,
                                  delay: 0.5 + index * 0.1,
                                }}
                                className="h-full rounded-full"
                                style={{ background: statusColor }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Grievance ID
                              </p>
                              <p className="font-mono text-blue-400 font-semibold text-xs md:text-sm break-all">
                                {grievance.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            ) : (
              <GlassCard>
                <div className="text-center py-12">
                  <AlertCircle
                    size={48}
                    className="mx-auto mb-4 text-slate-500"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Active Grievances
                  </h3>
                  <p className="text-slate-400">
                    All your grievances have been resolved.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
