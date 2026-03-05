import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { GlassCard, ProgressBar } from "../components/GlassCard";
import {
  ArrowLeft,
  Clock,
  User,
  Send,
  CheckCircle2,
  MessageSquare,
  Gauge,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  Users,
  MoreVertical,
  Flag,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Activity,
  UserPlus,
  Zap,
  FileText,
  AlertTriangle,
  Calendar,
  Text,
} from "lucide-react";
import moment from "moment";
import {
  useGetIssueByIdQuery,
  useResolveIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useAddCommentMutation,
  useSearchStaffsQuery,
} from "../../services/api";
import _ from "lodash";

export default function AdminIssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const { data: issue, refetch, isLoading } = useGetIssueByIdQuery(issueId!);
  const [resolveIssue] = useResolveIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();
  const [addCommentMutation] = useAddCommentMutation();

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [showStatusReasonModal, setShowStatusReasonModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const { data: staffList = [] } = useSearchStaffsQuery(staffSearch);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const statuses = [
    { value: "open", label: "Open", icon: FileText, color: "#f59e0b" },
    {
      value: "in_progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "#3b82f6",
    },
    { value: "on_hold", label: "On Hold", icon: PauseCircle, color: "#8b5cf6" },
    { value: "escalated", label: "Escalated", icon: Zap, color: "#f97316" },
    {
      value: "resolved",
      label: "Resolved",
      icon: CheckCircle2,
      color: "#22c55e",
    },
    { value: "closed", label: "Closed", icon: X, color: "#64748b" },
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
    if (issue) {
      setProgress(issue.progress || 0);
      setEditedTitle(issue.title || "");
      setEditedDescription(issue.description || "");
    }
  }, [issue]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [issue?.workLogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar role="admin" />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-slate-400 animate-pulse">Loading issue...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen">
        <Sidebar role="admin" />
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
  const capitalizeStatus = (s: string) =>
    s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const currentStatus =
    statuses.find((s) => s.value === normalizeStatus(issue.status)) ||
    statuses[0];
  const getPriorityStyle = (p: string) =>
    priorities.find((pr) => pr.value === p)?.color || priorities[0].color;
  const isEscalated = normalizeStatus(issue.status) === "escalated";

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
        workLogMessage: `Admin changed status to ${capitalizeStatus(pendingStatus)}: ${statusChangeReason}`,
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
        workLogMessage: `Admin updated progress to ${progress}%`,
      }).unwrap();
      setShowProgressUpdate(false);
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
        workLogMessage: `Admin resolved: ${resolution}`,
      }).unwrap();
      refetch();
      setResolution("");
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    } finally {
      setResolving(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateIssue({
        issueId: issueId!,
        title: editedTitle,
        description: editedDescription,
        workLogMessage: "Issue details updated by admin",
      }).unwrap();
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm("Delete this issue? This cannot be undone.")) return;
    try {
      await deleteIssue(issueId!).unwrap();
      navigate("/admin/issues");
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

  const handleReassign = async () => {
    if (!selectedStaff) return alert("Please select a staff member");
    try {
      await updateIssue({
        issueId: issueId!,
        assignedTo: selectedStaff._id,
        workLogMessage: `Reassigned by admin to ${selectedStaff.name}`,
      }).unwrap();
      setShowReassignModal(false);
      setSelectedStaff(null);
      setStaffSearch("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateIssue({
        issueId: issueId!,
        priority: newPriority,
        workLogMessage: `Priority changed to ${newPriority} by admin`,
      }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed");
    }
  };

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
            {/* Escalation banner */}
            {isEscalated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 px-4 md:px-5 py-3 bg-orange-500/15 border border-orange-500/40 rounded-xl text-orange-300 flex-wrap"
              >
                <Zap size={18} className="text-orange-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    This issue was escalated by staff and requires admin
                    attention.
                  </p>
                  <p className="text-xs text-orange-400/70 mt-0.5">
                    Review the activity log below for escalation reason.
                  </p>
                </div>
              </motion.div>
            )}

            {/* CHANGED: wrap on mobile */}
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
                    {isEditing ? (
                      <input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-xl md:text-3xl font-bold bg-transparent border-b border-blue-500 text-white focus:outline-none w-full md:w-96"
                      />
                    ) : (
                      <h1 className="text-xl md:text-3xl font-bold text-white">
                        {issue.title}
                      </h1>
                    )}
                    <span className="px-2 py-1 text-xs font-mono text-slate-400 bg-slate-800/50 rounded border border-slate-700 shrink-0">
                      #{issue._id?.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Opened {moment(issue.createdAt).fromNow()} by{" "}
                    {issue.createdBy?.name || "Student"}
                  </p>
                </div>
              </div>

              {/* Admin action buttons */}
              <div className="flex gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    isEditing ? handleSaveEdit() : setIsEditing(true)
                  }
                  className={`p-2.5 rounded-lg transition-colors ${isEditing ? "bg-green-500/20 hover:bg-green-500/30 text-green-400" : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"}`}
                >
                  {isEditing ? <Save size={18} /> : <Edit size={18} />}
                </motion.button>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReassignModal(true)}
                  className="p-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                >
                  <UserPlus size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteIssue}
                  className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </div>

            {/* Status bar - CHANGED: wrap on mobile */}
            <div className="flex items-center gap-2 md:gap-4 flex-wrap ml-10 md:ml-12">
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all hover:brightness-110"
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

              <button
                onClick={() => setShowProgressUpdate(!showProgressUpdate)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-lg text-slate-300 text-sm transition-colors"
              >
                <Gauge size={15} />
                {progress}%
              </button>
            </div>
          </motion.div>

          {/* Progress update panel */}
          <AnimatePresence>
            {showProgressUpdate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <GlassCard>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Gauge size={20} className="text-blue-400" />
                    Update Progress
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 text-sm">Completion</span>
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
                    className="w-full accent-blue-500 mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProgress}
                      disabled={resolving}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium"
                    >
                      {resolving ? "Saving..." : "Save Progress"}
                    </button>
                    <button
                      onClick={() => setShowProgressUpdate(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

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
                    Change to {capitalizeStatus(pendingStatus)}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Reason for this status change:
                  </p>
                  <textarea
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
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

          {/* Reassign Modal */}
          <AnimatePresence>
            {showReassignModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowReassignModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Reassign Issue
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {isEscalated
                      ? "Assign this escalated issue to a staff member:"
                      : "Select a staff member:"}
                  </p>
                  <input
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none text-white text-sm mb-3"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                    {staffList.map((staff: any) => (
                      <button
                        key={staff._id}
                        onClick={() => setSelectedStaff(staff)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${selectedStaff?._id === staff._id ? "bg-purple-500/20 border-purple-500/50" : "bg-slate-800/50 border-slate-700 hover:border-purple-500/30"}`}
                      >
                        <p className="text-white font-medium text-sm">
                          {staff.name}
                        </p>
                        <p className="text-slate-400 text-xs">{staff.email}</p>
                        {staff.department && (
                          <p className="text-slate-500 text-xs">
                            {staff.department}
                          </p>
                        )}
                      </button>
                    ))}
                    {staffList.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">
                        No staff found
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReassign}
                      disabled={!selectedStaff}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                    >
                      Reassign
                    </button>
                    <button
                      onClick={() => {
                        setShowReassignModal(false);
                        setSelectedStaff(null);
                        setStaffSearch("");
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
            {/* Left col */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Description */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Text size={18} />
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none text-white resize-none h-32"
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {issue.description}
                  </p>
                )}
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
                    placeholder="Add an admin note or comment..."
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

            {/* Right col */}
            <div className="space-y-4 md:space-y-6">
              {/* Reporter */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={18} />
                  Reported By
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="text-white font-medium">
                      {issue.createdBy?.name || "Anonymous"}
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

              {/* Assignment */}
              <GlassCard>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Assignment
                </h3>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned To</span>
                    <span className="text-white font-medium">
                      {issue.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                  {issue.assignedTo?.email && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400 shrink-0">Email</span>
                      <span className="text-blue-400 text-xs truncate">
                        {issue.assignedTo.email}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {issue.assignedTo ? "Reassign" : "Assign to Staff"}
                </button>
              </GlassCard>

              {/* Timeline */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} />
                  <h3 className="font-semibold text-white">Timeline</h3>
                </div>
                <div className="text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created</span>
                    <span className="text-white">
                      {moment(issue.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Updated</span>
                    <span className="text-white">
                      {moment(issue.updatedAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Days Open</span>
                    <span
                      className={`font-medium ${moment().diff(moment(issue.createdAt), "days") > 7 ? "text-amber-400" : "text-white"}`}
                    >
                      {moment().diff(moment(issue.createdAt), "days")}d
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Resolve */}
              {!["resolved", "closed"].includes(
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
                      placeholder="Describe how this was resolved..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-green-500 focus:outline-none text-white text-sm resize-none h-24"
                    />
                    <button
                      onClick={handleResolve}
                      disabled={resolving || !resolution.trim()}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
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
