import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, StatCard } from "../components/GlassCard";
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useGetAdminDashboardStatsQuery,
  useGetAdminMonthlyTrendsQuery,
  useGetAdminCategoryDistributionQuery,
  useGetAdminPriorityOverviewQuery,
  useGetAdminRecentIssuesQuery,
  useGetAdminKeyMetricsQuery,
} from "../../services/api";
import _ from "lodash";
import moment from "moment";
import { useNavigate } from "react-router";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(26, 31, 46, 0.95)",
    border: "1px solid rgb(51, 65, 85)",
    borderRadius: "8px",
    color: "#fff",
  },
};

const priorityColor: Record<string, string> = {
  High: "#ef4444",
  Critical: "#dc2626",
  Medium: "#f59e0b",
  Low: "#10b981",
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  assigned: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  resolved: "bg-green-500/20 text-green-400",
  open: "bg-slate-500/20 text-slate-400",
  escalated: "bg-red-500/20 text-red-400",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-700/40 rounded-lg ${className}`} />
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAdminDashboardStatsQuery();
  const { data: trends = [], isLoading: trendsLoading } =
    useGetAdminMonthlyTrendsQuery(7);
  const CATEGORY_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ];

  const { data: rawCategories = [], isLoading: catsLoading } =
    useGetAdminCategoryDistributionQuery();

  const categories = rawCategories.map((cat: any, i: number) => ({
    ...cat,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const { data: priorities = [], isLoading: priLoading } =
    useGetAdminPriorityOverviewQuery();
  const {
    data: recentIssues = [],
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useGetAdminRecentIssuesQuery(5);
  const { data: keyMetrics } = useGetAdminKeyMetricsQuery();

  const handleRefresh = () => {
    refetchStats();
    refetchRecent();
  };

  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />

      {/* CHANGED: ml-0 on mobile, ml-64 on md+ */}
      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        {/* Grid background */}
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

        {/* CHANGED: p-4 on mobile, p-8 on md+ */}
        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 flex items-start justify-between gap-4"
          >
            <div>
              {/* CHANGED: smaller heading on mobile */}
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-white">
                Admin Control Panel
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Real-time monitoring and management system
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl transition-all shrink-0"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </motion.div>

          {/* Stats Grid - CHANGED: 2 cols on mobile, 4 on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : (
              <>
                <StatCard
                  icon={Activity}
                  title="Total Issues"
                  value={stats?.totalIssues ?? 0}
                  color="#3b82f6"
                  trend={`+${stats?.byStatus?.find((s: any) => s._id === "open")?.count ?? 0} open`}
                />
                <StatCard
                  icon={Clock}
                  title="Pending"
                  value={
                    stats?.byStatus?.find((s: any) => s._id === "open")
                      ?.count ?? 0
                  }
                  color="#f59e0b"
                  trend={`${stats?.byPriority?.find((p: any) => p._id === "Critical")?.count ?? 0} critical`}
                />
                <StatCard
                  icon={CheckCircle2}
                  title="Resolved"
                  value={stats?.resolved ?? 0}
                  color="#10b981"
                  trend={`${stats?.resolutionRate ?? 0}% success rate`}
                />
                <StatCard
                  icon={Users}
                  title="Active Teams"
                  value={stats?.activeTeams ?? 0}
                  color="#8b5cf6"
                  trend={
                    keyMetrics?.satisfaction
                      ? `${keyMetrics.satisfaction.value}% satisfaction`
                      : "Tracking..."
                  }
                />
              </>
            )}
          </div>

          {/* Key Metrics Row - CHANGED: 1 col on mobile, 3 on md */}
          {keyMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                {
                  label: "Avg First Response",
                  value: `${keyMetrics.firstResponseTime.value} ${keyMetrics.firstResponseTime.unit}`,
                  trend: keyMetrics.firstResponseTime.trend,
                  color: "#3b82f6",
                  up: keyMetrics.firstResponseTime.trend === "down",
                },
                {
                  label: "Reopen Rate",
                  value: `${keyMetrics.reopenRate.value}${keyMetrics.reopenRate.unit}`,
                  trend: keyMetrics.reopenRate.trend,
                  color: "#ef4444",
                  up: keyMetrics.reopenRate.trend === "down",
                },
                {
                  label: "Satisfaction Score",
                  value: `${keyMetrics.satisfaction.value}${keyMetrics.satisfaction.unit}`,
                  trend: keyMetrics.satisfaction.trend,
                  color: "#10b981",
                  up: keyMetrics.satisfaction.trend === "up",
                },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between px-4 md:px-5 py-4 rounded-xl bg-slate-800/30 border border-slate-700/40"
                >
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {m.value}
                    </p>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.up
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {m.trend === "up" ? "↑" : "↓"} {m.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Charts Row - CHANGED: 1 col on mobile, 2 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Trend Chart */}
            <GlassCard>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Issue Trends
              </h3>
              {trendsLoading ? (
                <Skeleton className="h-60" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trends}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.1)"
                    />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="issues"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>

            {/* Category Distribution */}
            <GlassCard>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-white">
                Category Distribution
              </h3>
              {catsLoading ? (
                <Skeleton className="h-60" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* CHANGED: 2 cols always for legend */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {categories.map((cat: any) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span className="text-xs text-slate-400 truncate">
                          {cat.name}
                        </span>
                        <span
                          className="text-xs font-semibold ml-auto"
                          style={{ color: cat.color }}
                        >
                          {cat.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>

          {/* Priority + Real-time Feed - CHANGED: 1 col on mobile, 3 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Priority Bar Chart */}
            <GlassCard>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-400" />
                Priority Overview
              </h3>
              {priLoading ? (
                <Skeleton className="h-48" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={priorities}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.1)"
                    />
                    <XAxis dataKey="priority" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {priorities.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.color ||
                            priorityColor[entry.priority] ||
                            "#94a3b8"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>

            {/* Real-time Feed */}
            <GlassCard className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-blue-400" />
                <h3 className="text-base md:text-lg font-semibold text-white">
                  Real-time Updates
                </h3>
                <span className="ml-auto text-xs text-slate-500">Live</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              {recentLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentIssues.map((issue: any, index: number) => (
                    <motion.div
                      key={issue.id || issue._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.07 }}
                      whileHover={{ x: 4 }}
                      onClick={() =>
                        navigate(`/admin/issues/${issue.id || issue._id}`)
                      }
                      className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs text-blue-400">
                              {String(issue.id || issue._id)
                                .slice(-6)
                                .toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                issue.priority === "High" ||
                                issue.priority === "Critical"
                                  ? "bg-red-500/20 text-red-400"
                                  : issue.priority === "Medium"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {issue.priority}
                            </span>
                            {issue.category && (
                              <span className="text-xs text-slate-500 hidden sm:inline">
                                {_.startCase(issue.category)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white mb-1 truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {issue.time
                              ? issue.time
                              : moment(issue.createdAt).fromNow()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-1 rounded-lg text-xs whitespace-nowrap ${
                            statusStyle[
                              (issue.status || "")
                                .toLowerCase()
                                .replace(/\s/g, "_")
                            ] || "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {_.startCase(issue.status)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {recentIssues.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-8">
                      No recent issues
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate("/admin/issues")}
                className="mt-4 w-full text-xs text-blue-500 hover:text-blue-400 text-center transition-colors"
              >
                View all issues →
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
