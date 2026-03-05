import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, StatCard, ProgressRing } from "../components/GlassCard";
import {
  ClipboardList,
  LoaderCircle,
  BadgeCheck,
  AlertCircle,
  Clock,
  MessageSquare,
  Bell,
  TrendingUp,
} from "lucide-react";
import {
  useGetIssueStatsQuery,
  useGetRecentIssuesQuery,
  useGetNotificationsQuery,
  useGetIssueTimelineQuery,
} from "../../services/api";
import _ from "lodash";
import moment from "moment";
import { useNavigate } from "react-router";

const statusConfig = {
  resolved: { bg: "bg-green-500/20", text: "text-green-400" },
  in_progress: { bg: "bg-blue-500/20", text: "text-blue-400" },
  open: { bg: "bg-amber-500/20", text: "text-amber-400" },
  escalated: { bg: "bg-orange-500/20", text: "text-orange-400" },
  on_hold: { bg: "bg-purple-500/20", text: "text-purple-400" },
  closed: { bg: "bg-slate-500/20", text: "text-slate-400" },
  pending: { bg: "bg-gray-500/20", text: "text-gray-400" },
  denied: { bg: "bg-red-500/20", text: "text-red-400" },
};

const categoryColors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { data } = useGetIssueStatsQuery();
  const { data: issue = [] } = useGetRecentIssuesQuery();
  const { data: notifications = [] } = useGetNotificationsQuery({ limit: 4 });
  const { data: timeline = [] } = useGetIssueTimelineQuery({ limit: 5 });

  const statusMap = _.keyBy(data?.byStatus || [], "_id");
  const resolved = statusMap.resolved?.count || 0;
  const open = statusMap.open?.count || 0;
  const inProgress = statusMap["in_progress"]?.count || 0;
  const total = resolved + open + inProgress;
  const progress = total ? Math.round((resolved / total) * 100) : 0;

  const categoryData = data?.byCategory || [];

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
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-white">
              Student Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Monitor and manage your grievances
            </p>
          </motion.div>

          {/* Stats Grid - CHANGED: 2 cols on mobile, 4 on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <StatCard
              icon={ClipboardList}
              title="Total Grievances"
              value={data?.totalGrievances}
              color="#3b82f6"
              trend="+2 this month"
            />
            <StatCard
              icon={LoaderCircle}
              title="In Progress"
              value={data?.inProgress}
              color="#f59e0b"
              trend="3 pending review"
            />
            <StatCard
              icon={BadgeCheck}
              title="Resolved"
              value={data?.resolved}
              color="#10b981"
              trend="58% success rate"
            />
            <StatCard
              icon={AlertCircle}
              title="Open"
              value={data?.open}
              color="#8b5cf6"
              trend="15% faster"
            />
          </div>

          {/* Row 2: Progress + Recent Grievances - CHANGED: 1 col on mobile, 3 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Resolution Progress */}
            <GlassCard className="lg:col-span-1 flex flex-col">
              <h3 className="text-base md:text-lg font-semibold mb-6 text-white">
                Resolution Progress
              </h3>
              <div className="flex flex-col items-center justify-center flex-1">
                <ProgressRing progress={progress} color="#3b82f6" />
                <div className="mt-6 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Resolved</span>
                    <span className="text-green-500">{resolved} cases</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">In Progress</span>
                    <span className="text-amber-500">{inProgress} cases</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Open</span>
                    <span className="text-red-500">{open} cases</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recent Grievances */}
            <GlassCard className="lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  Recent Grievances
                </h3>
                <button
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                  onClick={() => navigate("/track")}
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {issue.map((grievance, idx) => (
                  <motion.div
                    key={grievance._id || grievance.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/track/${grievance._id}`)}
                    className="p-3 md:p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white mb-1 text-sm truncate">
                          {grievance.title}
                        </h4>
                        {/* CHANGED: wrap on small screens */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                          <span>{_.startCase(grievance.category)}</span>
                          <span>•</span>
                          <span>
                            {moment(grievance.createdAt).format("MMM DD, YYYY")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${grievance.priority === "High" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
                          >
                            {_.startCase(grievance.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${statusConfig[grievance.status]?.bg || "bg-slate-500/20"} ${statusConfig[grievance.status]?.text || "text-slate-400"}`}
                        >
                          {_.startCase(grievance.status)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {issue.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <ClipboardList size={32} className="mb-3 opacity-40" />
                    <p className="text-sm">No grievances submitted yet</p>
                    <button
                      onClick={() => navigate("/submit")}
                      className="mt-3 text-xs text-blue-500 hover:text-blue-400"
                    >
                      Submit your first grievance →
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Bottom row - CHANGED: 1 col on mobile, 3 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Category Breakdown */}
            <GlassCard className="flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={16} className="text-purple-400" />
                <h3 className="text-base font-semibold text-white">
                  By Category
                </h3>
              </div>
              <div className="space-y-3">
                {categoryData.slice(0, 6).map((cat, idx) => {
                  const catPct = total
                    ? Math.round((cat.count / total) * 100)
                    : 0;
                  return (
                    <div key={cat._id || idx}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{_.startCase(cat._id || "Other")}</span>
                        <span>
                          {cat.count} ({catPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${catPct}%` }}
                          transition={{ duration: 0.7, delay: idx * 0.08 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[idx % categoryColors.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {categoryData.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-4">
                    No category data yet
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard className="flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-amber-400" />
                  <h3 className="text-base font-semibold text-white">
                    Notifications
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif._id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border transition-all ${!notif.read ? "bg-blue-500/10 border-blue-500/20" : "bg-slate-800/20 border-slate-700/30"}`}
                  >
                    <p className="text-sm text-slate-200">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {moment(notif.createdAt).fromNow()}
                    </p>
                  </motion.div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-6">
                    No notifications yet
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Activity Timeline */}
            <GlassCard className="flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare size={16} className="text-emerald-400" />
                <h3 className="text-base font-semibold text-white">
                  Activity Timeline
                </h3>
              </div>
              <div className="relative">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-700/50" />
                <div className="space-y-4 pl-7">
                  {timeline.map((item, idx) => (
                    <motion.div
                      key={item._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="relative"
                    >
                      <div
                        className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0f1419]"
                        style={{
                          backgroundColor:
                            item.type === "resolved"
                              ? "#10b981"
                              : item.type === "in_progress"
                                ? "#3b82f6"
                                : "#f59e0b",
                        }}
                      />
                      <p className="text-sm text-slate-300 font-medium">
                        {item.action || item.message}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.issueTitle || item.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {moment(item.createdAt).fromNow()}
                      </p>
                    </motion.div>
                  ))}
                  {timeline.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-6">
                      No activity yet
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
