import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, ProgressBar } from "../components/GlassCard";
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  Send,
  CheckCircle2,
  MessageSquare,
  Save,
  X,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Flag,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Zap,
  Text,
  AlertTriangle,
} from "lucide-react";
import moment from "moment";
import {
  useResolveIssueMutation,
  useUpdateIssueMutation,
  useAddCommentMutation,
  useGetAssignedIssueByIdQuery,
} from "../../services/api";
import _ from "lodash";

export default function StaffIssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const {
    data: issue,
    refetch,
    isLoading,
  } = useGetAssignedIssueByIdQuery(issueId as string);
  const [resolveIssue] = useResolveIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();
  const [addCommentMutation] = useAddCommentMutation();

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [showStatusReasonModal, setShowStatusReasonModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");

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
    { value: "closed", label: "Closed", icon: X, color: "#64748b" },
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
    if (issue) setProgress(issue.progress || 0);
  }, [issue]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [issue?.workLogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar role="staff" />
        {/* CHANGED: md:ml-64 */}
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-slate-400 animate-pulse">Loading issue...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen">
        <Sidebar role="staff" />
        <div className="md:ml-64 flex flex-col items-center justify-center min-h-screen gap-3">
          <AlertTriangle className="text-amber-400" size={40} />
          <p className="text-white text-lg">
            Issue not found or not assigned to you
          </p>
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
  const capitalizeStatus = (s: string) =>
    s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const isEscalated = normalizeStatus(issue.status) === "escalated";
  const escalationLog =
    [...(issue?.workLogs || [])]
      .reverse()
      .find(
        (l: any) =>
          l.type === "escalation" ||
          l.message?.toLowerCase().includes("escalat"),
      ) || null;
  const currentStatus =
    statuses.find((s) => s.value === normalizeStatus(issue.status)) ||
    statuses[0];
  const getPriorityStyle = (p: string) =>
    priorities.find((pr) => pr.value === p)?.color || priorities[0].color;

  const comments =
    issue?.workLogs?.map((log: any, idx: number) => ({
      id: log._id || idx,
      author: log.updatedBy?.name || "System",
      message: log.message,
      timestamp: log.createdAt,
      type: log.type || "comment",
    })) || [];

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === normalizeStatus(issue.status)) {
      setShowStatusDropdown(false);
      return;
    }
    setPendingStatus(newStatus);
    setShowStatusReasonModal(true);
    setShowStatusDropdown(false);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeReason.trim()) return alert("Please provide a reason");
    try {
      setResolving(true);
      await resolveIssue({
        issueId: issueId!,
        status: pendingStatus,
        workLogMessage: `Status changed to ${capitalizeStatus(pendingStatus)}: ${statusChangeReason}`,
      }).unwrap();
      setShowStatusReasonModal(false);
      setStatusChangeReason("");
      setPendingStatus("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    } finally {
      setResolving(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setResolving(true);
      await resolveIssue({
        issueId: issueId!,
        progress,
        workLogMessage: `Progress updated to ${progress}%`,
      }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    } finally {
      setResolving(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addCommentMutation({ issueId: issueId!, comment }).unwrap();
      setComment("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) return alert("Please provide resolution details");
    try {
      setResolving(true);
      await resolveIssue({
        issueId: issueId!,
        status: "resolved",
        progress: 100,
        resolution,
        workLogMessage: `Resolved: ${resolution}`,
      }).unwrap();
      refetch();
      setResolution("");
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    } finally {
      setResolving(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) return alert("Please provide a reason");
    try {
      setResolving(true);
      await resolveIssue({
        issueId: issueId!,
        escalateToAdmin: true,
        workLogMessage: `Escalated to admin: ${escalationReason}`,
      }).unwrap();
      setShowEscalateModal(false);
      setEscalationReason("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    } finally {
      setResolving(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateIssue({
        issueId: issueId!,
        priority: newPriority,
        workLogMessage: `Priority updated to ${newPriority}`,
      }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar role="staff" />

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
            {/* Escalation banner */}
            {isEscalated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl border border-orange-500/40 bg-orange-500/10 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 md:px-5 py-3 bg-orange-500/15 flex-wrap">
                  <Zap size={18} className="text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-orange-300 text-sm">
                      This complaint has been escalated to admin
                    </p>
                    <p className="text-xs text-orange-400/70 mt-0.5">
                      You cannot change the status until admin reviews and
                      reassigns it
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold rounded-full shrink-0">
                    Awaiting Admin
                  </span>
                </div>
                {escalationLog && (
                  <div className="px-4 md:px-5 py-3 border-t border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-orange-400 text-xs font-bold">
                          {(escalationLog.updatedBy?.name || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          <span className="text-slate-300 font-medium">
                            {escalationLog.updatedBy?.name || "You"}
                          </span>{" "}
                          escalated {moment(escalationLog.createdAt).fromNow()}
                        </p>
                        <p className="text-sm text-slate-300">
                          {escalationLog.message
                            ?.replace(/^escalated(?: to admin)?[:\s-]*/i, "")
                            .trim() || "No reason provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* CHANGED: wrap header on mobile */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap md:flex-nowrap">
              <div className="flex items-start gap-3 md:gap-4">
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
                    <span className="px-2 py-1 text-xs font-mono text-slate-400 bg-slate-800/50 rounded border border-slate-700 shrink-0">
                      #{issue._id?.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Opened {moment(issue.createdAt).fromNow()} by{" "}
                    {issue.createdBy?.name || issue.studentName || "Student"}
                  </p>
                </div>
              </div>

              {!isEscalated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEscalateModal(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 rounded-xl text-sm font-medium transition-all shrink-0"
                >
                  <Zap size={16} />
                  <span className="hidden sm:inline">Escalate to Admin</span>
                  <span className="sm:hidden">Escalate</span>
                </motion.button>
              )}
            </div>

            {/* Status bar - CHANGED: wrap on mobile */}
            <div className="flex items-center gap-2 md:gap-4 flex-wrap ml-10 md:ml-12">
              <div className="relative">
                <button
                  onClick={() =>
                    !isEscalated && setShowStatusDropdown(!showStatusDropdown)
                  }
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all ${isEscalated ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
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
                  <MoreVertical size={13} />
                </button>
                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusChange(status.value)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                          style={{
                            backgroundColor:
                              status.value === normalizeStatus(issue.status)
                                ? `${status.color}10`
                                : "transparent",
                          }}
                        >
                          <status.icon
                            size={16}
                            style={{ color: status.color }}
                          />
                          <span className="text-white text-sm">
                            {status.label}
                          </span>
                          {status.value === normalizeStatus(issue.status) && (
                            <CheckCircle2
                              size={14}
                              className="ml-auto"
                              style={{ color: status.color }}
                            />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2">
                <Flag size={15} className="text-slate-400" />
                <select
                  value={issue.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${getPriorityStyle(issue.priority)}`}
                  style={{ background: "transparent" }}
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm">
                {_.startCase(issue.category)}
              </div>
            </div>
          </motion.div>

          {/* Status Change Modal */}
          <AnimatePresence>
            {showStatusReasonModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowStatusReasonModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Change Status to {capitalizeStatus(pendingStatus)}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Provide a reason for this change:
                  </p>
                  <textarea
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    placeholder="Reason for status change..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white text-sm resize-none h-28 mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={confirmStatusChange}
                      disabled={resolving || !statusChangeReason.trim()}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                    >
                      {resolving ? "Updating..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusReasonModal(false);
                        setStatusChangeReason("");
                        setPendingStatus("");
                      }}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Escalate Modal */}
          <AnimatePresence>
            {showEscalateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowEscalateModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
                >
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <Zap className="text-orange-400" size={20} />
                    Escalate to Admin
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    This will notify admin and mark the issue as escalated.
                    Provide a reason:
                  </p>
                  <textarea
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder="Why does this need admin attention?"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-orange-500 focus:outline-none text-white text-sm resize-none h-28 mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEscalate}
                      disabled={resolving || !escalationReason.trim()}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                    >
                      {resolving ? "Escalating..." : "Escalate"}
                    </button>
                    <button
                      onClick={() => {
                        setShowEscalateModal(false);
                        setEscalationReason("");
                      }}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHANGED: Main Grid — 1 col on mobile, 3-col on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left col — full width on mobile, 2/3 on lg */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Description */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Text size={18} />
                  Description
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {issue.description}
                </p>
              </GlassCard>

              {/* Progress */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Progress
                </h3>
                <div className="space-y-4">
                  {normalizeStatus(issue.status) === "in_progress" ? (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400 text-sm">
                            Completion
                          </span>
                          <span className="text-blue-400 font-semibold">
                            {progress}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => setProgress(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleUpdateProgress}
                        disabled={resolving}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium"
                      >
                        {resolving ? "Saving..." : "Save Progress"}
                      </button>
                    </>
                  ) : (
                    <ProgressBar
                      progress={issue.progress || 0}
                      color={issue.progress === 100 ? "#22c55e" : "#2563eb"}
                    />
                  )}
                </div>
              </GlassCard>

              {/* Activity & Comments */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Activity & Comments
                </h3>
                <div className="space-y-3 mb-4 max-h-80 md:max-h-96 overflow-y-auto pr-1">
                  {comments.length > 0 ? (
                    comments.map((msg: any) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-medium">
                              {msg.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-white text-sm">
                                {msg.author}
                              </span>
                              <span className="text-xs text-slate-500">
                                {moment(msg.timestamp).fromNow()}
                              </span>
                              {msg.type &&
                                msg.type !== "comment" &&
                                msg.type !== "system" && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      msg.type === "status_change"
                                        ? "bg-purple-500/20 text-purple-400"
                                        : msg.type === "progress_update"
                                          ? "bg-blue-500/20 text-blue-400"
                                          : msg.type === "escalation"
                                            ? "bg-orange-500/20 text-orange-400"
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
                      <p className="text-sm">No activity yet.</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a work note or comment..."
                    className="flex-1 px-3 md:px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="px-3 md:px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Right col — full width on mobile, 1/3 on lg */}
            <div className="space-y-4 md:space-y-6">
              {/* Student info */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={18} />
                  Reported By
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="text-white font-medium">
                      {issue.createdBy?.name || issue.studentName || "Student"}
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

              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Assignment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned To</span>
                    <span className="text-white font-medium">
                      {issue.assignedTo?.name || "You"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Email</span>
                    <span className="text-blue-400 text-xs truncate">
                      {issue.assignedTo?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created</span>
                    <span className="text-white">
                      {moment(issue.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="text-white">
                      {moment(issue.updatedAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Days Open</span>
                    <span
                      className={`font-medium ${moment().diff(moment(issue.createdAt), "days") > 7 ? "text-red-400" : "text-white"}`}
                    >
                      {moment().diff(moment(issue.createdAt), "days")} days
                    </span>
                  </div>
                </div>
              </GlassCard>

              {issue.location && (
                <GlassCard>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Location
                  </h3>
                  <p className="text-slate-300 text-sm">{issue.location}</p>
                </GlassCard>
              )}

              {!isEscalated &&
                !["resolved", "closed"].includes(
                  normalizeStatus(issue.status),
                ) && (
                  <GlassCard>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-green-400" />
                      Mark as Resolved
                    </h3>
                    <div className="space-y-3">
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe how this issue was resolved..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-green-500 focus:outline-none text-white text-sm resize-none h-24"
                      />
                      <button
                        onClick={handleResolve}
                        disabled={resolving || !resolution.trim()}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        {resolving ? "Resolving..." : "Mark as Resolved"}
                      </button>
                    </div>
                  </GlassCard>
                )}

              {normalizeStatus(issue.status) === "resolved" &&
                issue.resolution && (
                  <GlassCard>
                    <h3 className="text-base md:text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={20} />
                      Resolution
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
