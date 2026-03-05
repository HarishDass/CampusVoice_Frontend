import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import {
  useSubmitIssueMutation,
  useSearchStaffsQuery,
} from "../../services/api";
import {
  Construction,
  BookOpen,
  Wifi,
  ShieldAlert,
  BedDouble,
  Bus,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
  });

  const [searchInput, setSearchInput] = useState("");
  const [assignedTo, setAssignedTo] = useState<{
    id: string;
    name: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchInput, 350);
  const { data: staffResults = [], isFetching: isSearching } =
    useSearchStaffsQuery(debouncedSearch || undefined, { skip: !dropdownOpen });

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitIssue, { isLoading, error }] = useSubmitIssueMutation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categories = [
    {
      id: "Academic",
      icon: BookOpen,
      label: "Academic",
      color: "#6366f1",
      desc: "Exams, results, timetable, faculty issues",
    },
    {
      id: "Infrastructure",
      icon: Construction,
      label: "Infrastructure",
      color: "#f59e0b",
      desc: "Classrooms, labs, furniture repairs",
    },
    {
      id: "Hostel & Facilities",
      icon: BedDouble,
      label: "Hostel & Facilities",
      color: "#8b5cf6",
      desc: "Hostel rooms, mess, water, electricity",
    },
    {
      id: "IT & Network",
      icon: Wifi,
      label: "IT & Network",
      color: "#22d3ee",
      desc: "Internet, portals, software access",
    },
    {
      id: "Transport",
      icon: Bus,
      label: "Transport",
      color: "#10b981",
      desc: "Bus routes, timings, vehicle issues",
    },
    {
      id: "Administration & Safety",
      icon: ShieldAlert,
      label: "Administration & Safety",
      color: "#ef4444",
      desc: "Fees, documents, ID cards, security",
    },
  ];

  const handleSelectStaff = (staff: any) => {
    setAssignedTo({
      id: staff._id || staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    });
    setSearchInput(staff.name);
    setDropdownOpen(false);
  };

  const handleClearAssign = () => {
    setAssignedTo(null);
    setSearchInput("");
  };

  const handleSubmit = async () => {
    try {
      const result = await submitIssue({
        title: formData.title,
        description: formData.description,
        category: selectedCategory,
        priority: formData.priority,
        assignedTo: assignedTo?.id,
      }).unwrap();
      setSubmittedId(result._id || result.id || null);
      setStep(4);
      setTimeout(() => navigate("/track"), 2500);
    } catch (err) {
      console.error("Failed to submit grievance:", err);
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
            backgroundImage: `linear-gradient(rgba(148,163,184,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.3) 1px,transparent 1px)`,
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
              Submit Grievance
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Report an issue and track its resolution
            </p>
          </motion.div>

          {/* Progress Steps - CHANGED: compact on mobile */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Category" },
                { num: 2, label: "Details" },
                { num: 3, label: "Review" },
                { num: 4, label: "Done" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm md:text-base transition-all ${
                        step >= s.num
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-800/50 text-slate-500"
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                    </div>
                    <span
                      className={`text-xs mt-1.5 hidden sm:block ${step >= s.num ? "text-white" : "text-slate-500"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-1 mx-1.5 md:mx-4 rounded ${step > s.num ? "bg-blue-600" : "bg-slate-700"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Step 1 — Category */}
            {step === 1 && (
              <GlassCard>
                <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-white">
                  Select Issue Category
                </h2>
                {/* CHANGED: 1 col on mobile, 2 on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setStep(2);
                      }}
                      className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                        <div className="p-2 rounded-lg bg-slate-700/50 shrink-0">
                          <cat.icon size={20} style={{ color: cat.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-white mb-0.5">
                            {cat.label}
                          </h3>
                          <p className="text-xs text-slate-400 leading-snug">
                            {cat.desc}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Step 2 — Details */}
            {step === 2 && (
              <GlassCard>
                <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-white">
                  Provide Issue Details
                </h2>
                <div className="space-y-4">
                  {/* CHANGED: Title + Assign To stacked on mobile, side-by-side on md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Issue Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-500 text-sm"
                        placeholder="Brief title of the issue"
                      />
                    </div>

                    {/* Assign To */}
                    <div ref={dropdownRef} className="relative">
                      <label className="block text-sm text-slate-400 mb-2">
                        Assign To
                      </label>
                      <div className="relative">
                        {assignedTo ? (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-white">
                              {assignedTo.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                            size={16}
                          />
                        )}
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => {
                            setSearchInput(e.target.value);
                            setAssignedTo(null);
                            setDropdownOpen(true);
                          }}
                          onFocus={() => setDropdownOpen(true)}
                          className={`w-full pl-10 pr-9 py-3 rounded-lg bg-slate-900/50 border focus:outline-none focus:ring-2 text-white placeholder-slate-500 transition-colors text-sm ${
                            assignedTo
                              ? "border-blue-500/60 focus:border-blue-500 focus:ring-blue-500/50"
                              : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          placeholder="Search staff or teacher..."
                          autoComplete="off"
                        />
                        {searchInput && (
                          <button
                            type="button"
                            onClick={handleClearAssign}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50 overflow-hidden"
                          >
                            {isSearching ? (
                              <div className="flex items-center gap-3 px-4 py-3 text-slate-400 text-sm">
                                <svg
                                  className="animate-spin h-4 w-4 text-blue-400"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  />
                                </svg>
                                Searching...
                              </div>
                            ) : staffResults.length === 0 ? (
                              <div className="px-4 py-3 text-slate-500 text-sm">
                                {debouncedSearch
                                  ? "No staff found"
                                  : "Type to search staff"}
                              </div>
                            ) : (
                              <ul className="max-h-52 overflow-y-auto">
                                {staffResults.map((staff: any) => (
                                  <li key={staff._id || staff.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectStaff(staff)}
                                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left ${
                                        assignedTo?.id ===
                                        (staff._id || staff.id)
                                          ? "bg-blue-600/10 border-l-2 border-blue-500"
                                          : ""
                                      }`}
                                    >
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold text-white">
                                          {staff.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                          {staff.name}
                                        </p>
                                        {staff.email && (
                                          <p className="text-xs text-slate-500 truncate">
                                            {staff.email}
                                          </p>
                                        )}
                                      </div>
                                      {staff.role && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 shrink-0">
                                          {staff.role}
                                        </span>
                                      )}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none placeholder-slate-500 text-sm"
                      placeholder="Detailed description of the issue..."
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Low", "Medium", "High"].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority })}
                          className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                            formData.priority === priority
                              ? priority === "High"
                                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                : priority === "Medium"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                                  : "bg-green-500/20 text-green-400 border border-green-500/50"
                              : "bg-slate-800/50 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 md:px-8 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white transition-all text-sm font-medium"
                    >
                      Back
                    </button>
                    <motion.button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.title || !formData.description}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Continue
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <GlassCard>
                <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-white">
                  Review & Submit
                </h2>
                {/* CHANGED: 1 col on mobile, 2 on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Category", value: selectedCategory },
                    { label: "Title", value: formData.title || "Not provided" },
                    {
                      label: "Assigned To",
                      value: assignedTo?.name || "Not assigned",
                      className: assignedTo
                        ? "text-blue-300"
                        : "text-slate-500",
                    },
                    {
                      label: "Priority",
                      value: formData.priority,
                      className:
                        formData.priority === "High"
                          ? "text-red-400"
                          : formData.priority === "Medium"
                            ? "text-amber-400"
                            : "text-green-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                    >
                      <p className="text-xs md:text-sm text-slate-400 mb-1">
                        {item.label}
                      </p>
                      <p
                        className={`font-medium text-sm md:text-base ${item.className || "text-white"}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                  <div className="col-span-1 sm:col-span-2 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <p className="text-xs md:text-sm text-slate-400 mb-1">
                      Description
                    </p>
                    <p className="text-white text-sm md:text-base">
                      {formData.description || "Not provided"}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
                    Failed to submit. Please try again.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="px-6 md:px-8 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    Back
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Grievance"
                    )}
                  </motion.button>
                </div>
              </GlassCard>
            )}

            {/* Step 4 — Success */}
            {step === 4 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <GlassCard>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 md:mb-6 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={40} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    Grievance Submitted!
                  </h2>
                  <p className="text-slate-400 mb-2 text-sm md:text-base">
                    Your issue has been registered successfully
                  </p>
                  {submittedId && (
                    <p className="text-blue-400 font-mono text-sm">
                      ID: #{submittedId}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-4">
                    Redirecting to tracking page...
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
