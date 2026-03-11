import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  Trash2,
  Loader2,
  Activity,
  TrendingUp,
  Hash,
  GraduationCap,
  Users,
} from "lucide-react";
import moment from "moment";
import {
  useDeleteUserMutation,
  useGetUserActivityQuery, // ← you'll add this endpoint
  type UserRecord,
} from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type ActivityEvent = {
  _id: string;
  type:
    | "issue_submitted"
    | "issue_resolved"
    | "comment_added"
    | "status_changed"
    | "issue_reopened"
    | "issue_escalated"
    | "issue_deleted";
  title: string;
  description?: string;
  issueId?: string;
  createdAt: string;
  meta?: Record<string, string>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EVENT_CONFIG: Record<
  ActivityEvent["type"],
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  issue_submitted: {
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  issue_resolved: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  comment_added: {
    icon: MessageSquare,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  status_changed: {
    icon: RotateCcw,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  issue_reopened: {
    icon: RotateCcw,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  issue_escalated: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  issue_deleted: {
    icon: Trash2,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};
function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${
        role === "staff"
          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
          : role === "admin"
            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
      }`}
    >
      {role === "staff" ? <Users size={10} /> : <GraduationCap size={10} />}
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </span>
  );
}

// ─── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({
  event,
  isLast,
}: {
  event: ActivityEvent;
  isLast: boolean;
}) {
  const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.comment_added;
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3 group">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${cfg.bg} ${cfg.border}`}
        >
          <Icon size={13} className={cfg.color} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700/40 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-5 flex-1 min-w-0 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm text-white font-medium leading-snug">
            {event.title}
          </p>
          {event.issueId && (
            <a
              href={`/issues/${event.issueId}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 text-slate-600 hover:text-blue-400 transition-colors"
            >
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-1">
            {event.description}
          </p>
        )}
        {event.meta && Object.keys(event.meta).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {Object.entries(event.meta).map(([k, v]) => (
              <span
                key={k}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-400"
              >
                {k}: <span className="text-slate-300">{v}</span>
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-slate-600">
          {moment(event.createdAt).format("DD MMM YYYY · h:mm A")} ·{" "}
          {moment(event.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/30 flex-1">
      <Icon size={13} className={color} />
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-600 text-center leading-tight">
        {label}
      </p>
    </div>
  );
}

// ─── Main Drawer ───────────────────────────────────────────────────────────────
export default function UserActivityDrawer({
  user,
  onClose,
}: {
  user: UserRecord;
  onClose: () => void;
}) {
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  console.log(user,"user")
  // Fetch activity — add this endpoint to your RTK Query service:
  // GET /api/admin/users/:id/activity  → { events: ActivityEvent[], stats: {...} }
  const { data: activity, isLoading: actLoading } = useGetUserActivityQuery(
    user?._id,
  );

  const events: ActivityEvent[] = activity?.events ?? [];
  const stats = activity?.stats ?? {
    totalIssues: 0,
    resolved: 0,
    comments: 0,
    lastActive: null,
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete ${user?.name ?? user?.email}?`)) return;
    await deleteUser(user?._id);
    onClose();
  };

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — full-height side sheet on mobile, centered modal on sm+ */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl bg-[#0c1117] border-l sm:border border-slate-700/60 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Role stripe */}
        <div
          className={`h-1 w-full shrink-0 ${
            user?.role === "staff"
              ? "bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600"
              : "bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${
                user?.role === "staff"
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                  : "bg-blue-500/20 border-blue-500/40 text-blue-400"
              }`}
            >
              {initials}
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">
                {user?.name ?? (
                  <span className="italic text-slate-500">No name</span>
                )}
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={user?.role} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User meta */}
        <div className="px-5 py-3 border-b border-slate-700/30 shrink-0 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            Joined {moment(user?.createdAt).format("DD MMM YYYY")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            Updated {moment(user?.updatedAt).fromNow()}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash size={11} />
            <code className="text-[10px]">{user?._id.slice(-8)}</code>
          </span>
        </div>

        {/* Stats row */}
        <div className="px-5 py-3.5 border-b border-slate-700/30 shrink-0">
          {actLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-16 bg-slate-700/30 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <StatPill
                label="Issues"
                value={stats.totalIssues}
                icon={FileText}
                color="text-blue-400"
              />
              <StatPill
                label="Resolved"
                value={stats.resolved}
                icon={CheckCircle2}
                color="text-emerald-400"
              />
              <StatPill
                label="Comments"
                value={stats.comments}
                icon={MessageSquare}
                color="text-slate-400"
              />
              <StatPill
                label="Events"
                value={events.length}
                icon={Activity}
                color="text-amber-400"
              />
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={11} /> Activity Timeline
            </h3>
            {events.length > 0 && (
              <span className="text-[10px] text-slate-600">
                {events.length} event{events.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {actLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700/40 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3.5 bg-slate-700/40 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-700/40 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center mb-3">
                <Activity size={18} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">No activity yet</p>
              <p className="text-slate-600 text-xs mt-1">
                Actions will appear here as the user interacts
              </p>
            </div>
          ) : (
            <div>
              {events.map((ev, i) => (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <ActivityItem event={ev} isLast={i === events.length - 1} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-700/30 shrink-0 flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            {deleting ? "Deleting…" : "Delete User"}
          </button>
          <button
            onClick={() => window.open(`mailto:${user?.email}`, "_blank")}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/40 transition-all"
          >
            <Mail size={12} /> Email
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
