import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Activity, Clock } from "lucide-react";
import {
  useGetAdminMonthlyTrendsQuery,
  useGetAdminCategoryDistributionQuery,
  useGetAdminResolutionTimeQuery,
  useGetAdminStatusBreakdownQuery,
  useGetAdminKeyMetricsQuery,
  useGetAdminDashboardStatsQuery,
} from "../../services/api";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#fff",
  },
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-700/40 rounded-lg ${className}`} />
);

const FALLBACK_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function Analytics() {
  const { data: stats } = useGetAdminDashboardStatsQuery();
  const { data: rawTrends = [], isLoading: trendsLoading } =
    useGetAdminMonthlyTrendsQuery(7);
  const { data: rawCategories = [], isLoading: catsLoading } =
    useGetAdminCategoryDistributionQuery();
  const { data: resolutionTime = [], isLoading: resLoading } =
    useGetAdminResolutionTimeQuery();
  const { data: rawStatus = [], isLoading: statusLoading } =
    useGetAdminStatusBreakdownQuery();
  const { data: keyMetrics, isLoading: metricsLoading } =
    useGetAdminKeyMetricsQuery();

  const categories = rawCategories.map((c: any, i: number) => ({
    ...c,
    color: c.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
  const statusData = rawStatus.map((s: any, i: number) => ({
    ...s,
    color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
  const monthlyData = rawTrends.map((d: any) => ({
    ...d,
    submitted: d.issues ?? d.submitted,
  }));

  const resolutionRate = stats?.resolutionRate ?? 0;
  const avgResolutionDays =
    resolutionTime.length > 0
      ? (
          resolutionTime.reduce((sum: number, r: any) => sum + r.avgDays, 0) /
          resolutionTime.length
        ).toFixed(1)
      : "—";
  const activeIssues =
    (stats?.byStatus?.find((s: any) => s._id === "open")?.count ?? 0) +
    (stats?.byStatus?.find((s: any) => s._id === "in_progress")?.count ?? 0);
  const escalatedCount =
    stats?.byStatus?.find((s: any) => s._id === "escalated")?.count ?? 0;

  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />

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

        {/* CHANGED: p-4 md:p-8 */}
        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            {/* CHANGED: text-2xl md:text-4xl */}
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-white">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Comprehensive insights and performance metrics
            </p>
          </motion.div>

          {/* Key Metrics — CHANGED: grid-cols-2 lg:grid-cols-4 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {[
              {
                label: "Resolution Rate",
                value: `${resolutionRate}%`,
                sub: stats
                  ? `${stats.resolved} of ${stats.totalIssues} resolved`
                  : "Loading...",
                icon: TrendingUp,
                iconColor: "text-green-400",
                subColor: "text-green-400",
                delay: 0.1,
              },
              {
                label: "Avg Resolution",
                value: `${avgResolutionDays}d`,
                sub: resolutionTime.length
                  ? `${resolutionTime.length} priority levels`
                  : "No data yet",
                icon: Clock,
                iconColor: "text-blue-400",
                subColor: "text-blue-400",
                delay: 0.15,
              },
              {
                label: "Active Issues",
                value: String(activeIssues),
                sub:
                  escalatedCount > 0
                    ? `${escalatedCount} escalated`
                    : "None escalated",
                icon: Activity,
                iconColor: "text-amber-400",
                subColor:
                  escalatedCount > 0 ? "text-red-400" : "text-green-400",
                delay: 0.2,
              },
              {
                label: "Satisfaction",
                value: keyMetrics
                  ? `${keyMetrics.satisfaction.value}${keyMetrics.satisfaction.unit}`
                  : "—",
                sub: keyMetrics
                  ? `↑ ${keyMetrics.satisfaction.percentage} pts`
                  : "Loading...",
                icon: TrendingUp,
                iconColor: "text-green-400",
                subColor: "text-green-400",
                delay: 0.25,
              },
            ].map((m) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: m.delay }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs md:text-sm leading-tight">
                      {m.label}
                    </p>
                    <m.icon className={`${m.iconColor} shrink-0`} size={18} />
                  </div>
                  {/* CHANGED: text-2xl md:text-3xl */}
                  <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {m.value}
                  </p>
                  <p
                    className={`text-xs md:text-sm leading-tight ${m.subColor}`}
                  >
                    {m.sub}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 — CHANGED: grid-cols-1 lg:grid-cols-2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <h2 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6">
                  Monthly Trends
                </h2>
                {trendsLoading ? (
                  <Skeleton className="h-52 md:h-72" />
                ) : monthlyData.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-20">
                    No trend data yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="submitted"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Submitted"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Resolved"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <GlassCard>
                <h2 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6">
                  Category Distribution
                </h2>
                {catsLoading ? (
                  <Skeleton className="h-52 md:h-72" />
                ) : categories.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-20">
                    No category data yet
                  </p>
                ) : (
                  <>
                    {/* CHANGED: removed inline pie labels (too cramped on mobile), legend below handles it */}
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {categories.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {categories.map((cat: any) => (
                        <div
                          key={cat.name}
                          className="flex items-center gap-1.5"
                        >
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
            </motion.div>
          </div>

          {/* Charts Row 2 — CHANGED: grid-cols-1 lg:grid-cols-2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Avg Resolution Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard>
                <h2 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6">
                  Avg. Resolution Time by Priority
                </h2>
                {resLoading ? (
                  <Skeleton className="h-52 md:h-72" />
                ) : resolutionTime.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-20">
                    No resolved issues yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={resolutionTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="priority"
                        stroke="#94a3b8"
                        fontSize={11}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        label={{
                          value: "Days",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar
                        dataKey="avgDays"
                        name="Avg Days"
                        radius={[6, 6, 0, 0]}
                      >
                        {resolutionTime.map((_: any, i: number) => {
                          const colors = [
                            "#dc2626",
                            "#ef4444",
                            "#f59e0b",
                            "#10b981",
                          ];
                          return <Cell key={i} fill={colors[i] || "#3b82f6"} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>
            </motion.div>

            {/* Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <GlassCard>
                <h2 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6">
                  Status Breakdown
                </h2>
                {statusLoading ? (
                  <Skeleton className="h-52 md:h-72" />
                ) : statusData.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-20">
                    No status data yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={statusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      {/* CHANGED: width={70} keeps labels readable without overflow */}
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={11}
                        width={70}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                        {statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* Performance Indicators — CHANGED: grid-cols-2 lg:grid-cols-4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard>
              <h2 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6">
                Performance Indicators
              </h2>
              {metricsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs md:text-sm mb-2 leading-tight">
                      First Response
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {keyMetrics
                        ? `${keyMetrics.firstResponseTime.value} ${keyMetrics.firstResponseTime.unit}`
                        : "—"}
                    </p>
                    <p
                      className={`text-xs md:text-sm mt-1 ${keyMetrics?.firstResponseTime.trend === "down" ? "text-green-400" : "text-red-400"}`}
                    >
                      {keyMetrics?.firstResponseTime.trend === "down"
                        ? "↓"
                        : "↑"}{" "}
                      {keyMetrics?.firstResponseTime.percentage}% faster
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-xs md:text-sm mb-2 leading-tight">
                      Reopen Rate
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {keyMetrics
                        ? `${keyMetrics.reopenRate.value}${keyMetrics.reopenRate.unit}`
                        : "—"}
                    </p>
                    <p
                      className={`text-xs md:text-sm mt-1 ${keyMetrics?.reopenRate.trend === "down" ? "text-green-400" : "text-red-400"}`}
                    >
                      {keyMetrics?.reopenRate.trend === "down" ? "↓" : "↑"}{" "}
                      {keyMetrics?.reopenRate.percentage}% lower
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-xs md:text-sm mb-2 leading-tight">
                      Team Utilization
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats
                        ? `${Math.min(Math.round(((stats.totalIssues - (stats.byStatus?.find((s: any) => s._id === "open")?.count || 0)) / Math.max(stats.totalIssues, 1)) * 100), 100)}%`
                        : "—"}
                    </p>
                    <p className="text-blue-400 text-xs md:text-sm mt-1">
                      Optimal range
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-xs md:text-sm mb-2 leading-tight">
                      Total Resolved
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats?.resolved ?? "—"}
                    </p>
                    <p className="text-green-400 text-xs md:text-sm mt-1">
                      {resolutionRate}% success rate
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
