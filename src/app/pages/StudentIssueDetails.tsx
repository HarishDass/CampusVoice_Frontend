import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, ProgressBar } from "../components/GlassCard";
import {
  ArrowLeft,
  User,
  MessageSquare,
  Send,
  X,
  MapPin,
  Calendar,
  Users,
  Flag,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  FileText,
  Activity,
  Text,
  AlertTriangle,
  Clock,
} from "lucide-react";
import moment from "moment";
import {
  useAddCommentMutation,
  useGetIssueByIdQuery,
} from "../../services/api";
import _ from "lodash";

export default function StudentIssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const {
    data: issue,
    refetch,
    isLoading,
  } = useGetIssueByIdQuery(issueId as string);
  const [addCommentMutation] = useAddCommentMutation();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const statuses = [
    { value: "open", label: "Open", icon: FileText, color: "#f59e0b" },
    {
      value: "in_progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "#3b82f6",
    },
    { value: "on_hold", label: "On Hold", icon: PauseCircle, color: "#8b5cf6" },
    {
      value: "resolved",
      label: "Resolved",
      icon: CheckCircle2,
      color: "#22c55e",
    },
    {
      value: "escalated",
      label: "Escalated",
      icon: AlertTriangle,
      color: "#ef4444",
    },
    { value: "closed", label: "Closed", icon: X, color: "#64748b" },
    { value: "pending", label: "Pending", icon: Clock, color: "#94a3b8" },
    { value: "denied", label: "Denied", icon: X, color: "#dc2626" },
  ];

  const priorities = [
    {
      value: "Low",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    {
      value: "Medium",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    { value: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    {
      value: "Critical",
      color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [issue?.workLogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar role="citizen" />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-slate-400 animate-pulse">Loading issue...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen">
        <Sidebar role="citizen" />
        <div className="md:ml-64 flex flex-col items-center justify-center min-h-screen gap-3">
          <AlertTriangle className="text-amber-400" size={40} />
          <p className="text-white">Issue not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 text-sm hover:underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const normalizeStatus = (s: string) =>
    s?.toLowerCase().replace(/\s+/g, "_") || "open";
  const currentStatus =
    statuses.find((s) => s.value === normalizeStatus(issue.status)) ||
    statuses[0];
  const getPriorityStyle = (p: string) =>
    priorities.find((pr) => pr.value === p)?.color || priorities[0].color;

  const activityFeed =
    issue?.workLogs?.map((log: any, idx: number) => ({
      id: log._id || idx,
      author: log.updatedBy?.name || "Staff",
      message: log.message,
      timestamp: log.createdAt,
      type: log.type || "comment",
    })) || [];

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      setSending(true);
      await addCommentMutation({ issueId: issueId!, comment }).unwrap();
      setComment("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to send comment");
    } finally {
      setSending(false);
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
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors shrink-0 mt-1"
              >
                <ArrowLeft className="text-slate-400" size={22} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-1">
                  <h1 className="text-xl md:text-3xl font-bold text-white">
                    {issue.title}
                  </h1>
                  <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 shrink-0">
                    #{issue._id?.slice(0, 8)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Submitted {moment(issue.createdAt).fromNow()}
                </p>
              </div>
            </div>

            {/* Status bar - CHANGED: wrap on mobile */}
            <div className="flex items-center gap-2 flex-wrap ml-10 md:ml-12">
              <div
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: `${currentStatus.color}20`,
                  borderColor: `${currentStatus.color}40`,
                  color: currentStatus.color,
                }}
              >
                <currentStatus.icon size={15} />
                <span className="font-medium text-sm">
                  {currentStatus.label}
                </span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm ${getPriorityStyle(issue.priority)}`}
              >
                <Flag size={13} />
                {issue.priority}
              </div>
              <div className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm">
                {_.startCase(issue.category)}
              </div>
            </div>
          </motion.div>

          {/* CHANGED: Main grid — single col on mobile, 3-col on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left col — full width on mobile, 2/3 on lg */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Description */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Text size={18} /> Description
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {issue.description}
                </p>
              </GlassCard>

              {/* Progress */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} /> Resolution Progress
                </h3>
                <ProgressBar
                  progress={issue.progress || 0}
                  color={issue.progress === 100 ? "#22c55e" : "#2563eb"}
                />
                <p className="text-slate-500 text-xs mt-3">
                  {issue.progress === 100
                    ? "✅ This issue has been fully resolved."
                    : issue.progress > 0
                      ? `Staff is ${issue.progress}% done working on this.`
                      : "Work has not started yet."}
                </p>
              </GlassCard>

              {/* Activity feed */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={18} /> Activity & Comments
                </h3>

                <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto pr-1 mb-4">
                  {activityFeed.length > 0 ? (
                    activityFeed.map((msg: any) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 md:p-4 rounded-lg border ${
                          msg.type === "escalation"
                            ? "bg-orange-500/10 border-orange-500/30"
                            : msg.type === "status_change"
                              ? "bg-purple-500/10 border-purple-500/30"
                              : msg.type === "progress_update"
                                ? "bg-blue-500/10 border-blue-500/30"
                                : msg.type === "resolution"
                                  ? "bg-green-500/10 border-green-500/30"
                                  : msg.type === "reassignment"
                                    ? "bg-indigo-500/10 border-indigo-500/30"
                                    : "bg-slate-800/50 border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                            {msg.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-white text-sm font-medium">
                                {msg.author}
                              </span>
                              <span className="text-slate-500 text-xs">
                                {moment(msg.timestamp).fromNow()}
                              </span>
                              {msg.type &&
                                !["comment", "system"].includes(msg.type) && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      msg.type === "escalation"
                                        ? "bg-orange-500/20 text-orange-400"
                                        : msg.type === "status_change"
                                          ? "bg-purple-500/20 text-purple-400"
                                          : msg.type === "progress_update"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : msg.type === "reassignment"
                                              ? "bg-indigo-500/20 text-indigo-400"
                                              : "bg-green-500/20 text-green-400"
                                    }`}
                                  >
                                    {msg.type.replace(/_/g, " ")}
                                  </span>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare
                        className="mx-auto mb-2 opacity-40"
                        size={28}
                      />
                      <p className="text-sm">No updates yet.</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a follow-up comment..."
                    className="flex-1 px-3 md:px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || sending}
                    className="px-3 md:px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Right col — full width on mobile, 1/3 on lg */}
            <div className="space-y-4 md:space-y-6">
              {/* Submitted By */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={18} /> Submitted By
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="text-white">
                      {issue.createdBy?.name || "You"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Email</span>
                    <span className="text-blue-400 text-xs truncate">
                      {issue.createdBy?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Assigned Staff */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={18} /> Assigned Staff
                </h3>
                {issue.assignedTo ? (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white">
                        {issue.assignedTo.name}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400 shrink-0">Email</span>
                      <span className="text-blue-400 text-xs truncate">
                        {issue.assignedTo.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Not yet assigned</p>
                )}
              </GlassCard>

              {/* Location */}
              {issue.location && (
                <GlassCard>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin size={18} /> Location
                  </h3>
                  <p className="text-slate-300 text-sm">{issue.location}</p>
                </GlassCard>
              )}

              {/* Timeline */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Timeline
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-white">
                      {moment(issue.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Update</span>
                    <span className="text-white">
                      {moment(issue.updatedAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Days Open</span>
                    <span
                      className={`font-medium ${moment().diff(moment(issue.createdAt), "days") > 14 ? "text-amber-400" : "text-white"}`}
                    >
                      {moment().diff(moment(issue.createdAt), "days")} days
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Resolution */}
              {normalizeStatus(issue.status) === "resolved" &&
                issue.resolution && (
                  <GlassCard>
                    <h3 className="text-base md:text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={20} /> Resolution
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {issue.resolution}
                    </p>
                  </GlassCard>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
