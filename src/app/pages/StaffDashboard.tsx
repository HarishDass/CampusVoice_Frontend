import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, StatCard, ProgressRing } from "../components/GlassCard";
import {
  ClipboardList,
  LoaderCircle,
  BadgeCheck,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  useGetStaffDashboardStatsQuery,
  useGetAssignedGrievancesQuery,
  useGetDepartmentStatsQuery,
  useGetStaffActivityQuery,
} from "../../services/api";
import _ from "lodash";
import moment from "moment";
import { useNavigate } from "react-router";

const priorityConfig = {
  high: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500" },
  medium: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  low: { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-500" },
};

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

export default function StaffDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useGetStaffDashboardStatsQuery();
  const { data: allIssues = [] } = useGetAssignedGrievancesQuery({ limit: 5 });
  const { data: deptStats = [] } = useGetDepartmentStatsQuery();
  const { data: activity = [] } = useGetStaffActivityQuery({ limit: 4 });

  const resolved = stats?.resolved || 0;
  const open = stats?.open || 0;
  const inProgress = stats?.inProgress || 0;
  const total = resolved + open + inProgress;
  const progress = total ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Sidebar role="staff" />

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
              Staff Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage and resolve student grievances
            </p>
          </motion.div>

          {/* Stats Grid - CHANGED: 2 cols on mobile, 4 on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <StatCard
              icon={ClipboardList}
              title="Total Grievances"
              value={stats?.totalGrievances}
              color="#3b82f6"
              trend={`+${stats?.newThisWeek || 0} this week`}
            />
            <StatCard
              icon={LoaderCircle}
              title="In Progress"
              value={stats?.inProgress}
              color="#f59e0b"
              trend={`${stats?.assignedToMe || 0} assigned to me`}
            />
            <StatCard
              icon={BadgeCheck}
              title="Resolved"
              value={stats?.resolved}
              color="#10b981"
              trend={`${progress}% resolution rate`}
            />
            <StatCard
              icon={AlertCircle}
              title="Escalated"
              value={stats?.escalated}
              color="#ef4444"
              trend="Needs attention"
            />
          </div>

          {/* Row 2 - CHANGED: 1 col on mobile, 3 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Resolution Progress */}
            <GlassCard className="lg:col-span-1 flex flex-col">
              <h3 className="text-base md:text-lg font-semibold mb-6 text-white">
                Resolution Overview
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
                    <span className="text-blue-400">{open} cases</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Escalated</span>
                    <span className="text-red-400">
                      {stats?.escalated || 0} cases
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Department-wise Stats */}
            <GlassCard className="lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  Department Overview
                </h3>
              </div>
              <div className="space-y-4">
                {deptStats.slice(0, 5).map((dept, idx) => {
                  const deptTotal = dept?.total;
                  const deptProgress = deptTotal
                    ? Math.round((dept.resolved / deptTotal) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={dept._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 md:gap-4"
                    >
                      {/* CHANGED: shorter label on mobile */}
                      <div className="w-20 md:w-28 text-xs md:text-sm text-slate-300 truncate">
                        {_.startCase(dept._id || "General")}
                      </div>
                      <div className="flex-1 bg-slate-800/60 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${deptProgress}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        />
                      </div>
                      <div className="w-9 text-right text-xs md:text-sm text-slate-400">
                        {deptProgress}%
                      </div>
                      <div className="w-12 text-right text-xs text-slate-500 hidden sm:block">
                        {deptTotal} total
                      </div>
                    </motion.div>
                  );
                })}
                {deptStats.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">
                    No department data available
                  </p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Row 3 - CHANGED: 1 col on mobile, 3 on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* All Recent Grievances */}
            <GlassCard className="lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  Recent Grievances
                </h3>
                <button
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                  onClick={() => navigate("/staff/issues")}
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {allIssues.map((grievance, idx) => (
                  <motion.div
                    key={grievance._id || grievance.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() =>
                      navigate(`/staff/issues/details/${grievance._id}`)
                    }
                    className="p-3 md:p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white mb-1 text-sm truncate">
                          {grievance.title}
                        </h4>
                        {/* CHANGED: wrap on mobile */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                          <span>
                            {grievance.studentName ||
                              grievance.submittedBy ||
                              "Student"}
                          </span>
                          <span>•</span>
                          <span>{_.startCase(grievance.category)}</span>
                          <span>•</span>
                          <span>{moment(grievance.createdAt).fromNow()}</span>
                          {grievance.priority && (
                            <>
                              <span>•</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-full ${priorityConfig[grievance.priority?.toLowerCase()]?.bg || "bg-slate-500/20"} ${priorityConfig[grievance.priority?.toLowerCase()]?.text || "text-slate-400"}`}
                              >
                                {_.startCase(grievance.priority)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig[grievance.status]?.bg || "bg-slate-500/20"} ${statusConfig[grievance.status]?.text || "text-slate-400"}`}
                      >
                        {_.startCase(grievance.status)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {allIssues.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">
                    No grievances found
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <div className="flex flex-col gap-4 md:gap-6">
              <GlassCard className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-400" />
                  <h3 className="text-base font-semibold text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="space-y-3">
                  {activity.slice(0, 4).map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-300">{item.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {moment(item.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-3">
                      No recent activity
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
