import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, ShieldCheck, Check } from "lucide-react";
import { useResetPasswordMutation } from "../../services/api";
import { Sidebar } from "../components/Sidebar";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const role =
    (localStorage.getItem("role") as "student" | "staff" | "admin") ||
    "student";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][
    strength
  ];

  const dashboardRoute =
    role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/student";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!checks.length) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ newPassword }).unwrap();
      setDone(true);
    } catch (err: any) {
      setError(err?.data?.message || "Something went wrong. Please try again.");
    }
  };
  const sidebarRole = role == "student" ? "citizen" : role;

  return (
    <div className="min-h-screen">
      <Sidebar role={sidebarRole as "admin" | "staff" | "citizen"} />

      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        {/* Grid */}
        <div
          className="fixed inset-0 md:ml-64 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 p-4 md:p-8">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
              Reset Password
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Update your account password — no old password required
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-lg"
          >
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {done ? (
                  /* ── Success ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-10 flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6"
                    >
                      <Check size={36} className="text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Password Updated!
                    </h2>
                    <p className="text-slate-400 text-sm mb-8">
                      Your password has been changed successfully.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(dashboardRoute)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      Back to Dashboard
                    </motion.button>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 md:p-8"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-7">
                      <div className="p-2.5 bg-blue-500/15 border border-blue-500/25 rounded-xl">
                        <KeyRound size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                          Set New Password
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Choose a strong password for your account
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* New password */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 font-medium tracking-wide uppercase">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setError("");
                            }}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 pr-11 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Strength bar */}
                        {newPassword.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3"
                          >
                            <div className="flex gap-1 mb-1.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-1 rounded-full transition-all duration-300"
                                  style={{
                                    backgroundColor:
                                      i <= strength ? strengthColor : "#1e293b",
                                  }}
                                />
                              ))}
                            </div>
                            <p
                              className="text-xs font-medium"
                              style={{ color: strengthColor }}
                            >
                              {strengthLabel}
                            </p>
                          </motion.div>
                        )}

                        {/* Checklist */}
                        {newPassword.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 grid grid-cols-2 gap-1.5"
                          >
                            {[
                              { label: "8+ characters", ok: checks.length },
                              { label: "Uppercase letter", ok: checks.upper },
                              { label: "Number", ok: checks.number },
                              {
                                label: "Special character",
                                ok: checks.special,
                              },
                            ].map(({ label, ok }) => (
                              <div
                                key={label}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                                    ok
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-slate-800 text-slate-600"
                                  }`}
                                >
                                  <Check size={9} strokeWidth={3} />
                                </div>
                                <span
                                  className={`text-xs transition-colors ${
                                    ok ? "text-slate-300" : "text-slate-600"
                                  }`}
                                >
                                  {label}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 font-medium tracking-wide uppercase">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setError("");
                            }}
                            placeholder="Re-enter new password"
                            className={`w-full px-4 py-3 pr-11 rounded-lg bg-slate-900/80 border text-white text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                              confirmPassword.length > 0
                                ? confirmPassword === newPassword
                                  ? "border-green-500/50 focus:border-green-500"
                                  : "border-red-500/50 focus:border-red-500"
                                : "border-slate-700 focus:border-blue-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showConfirm ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {confirmPassword.length > 0 &&
                          confirmPassword !== newPassword && (
                            <p className="text-xs text-red-400 mt-1.5">
                              Passwords do not match
                            </p>
                          )}
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating…
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            Update Password
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
