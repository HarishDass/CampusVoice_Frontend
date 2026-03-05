import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import {
  useForgotPasswordMutation,
  useVerifyOtpResetMutation,
} from "../../services/api";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: sendingOtp }] =
    useForgotPasswordMutation();
  const [verifyOtpReset, { isLoading: resetting }] =
    useVerifyOtpResetMutation();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Password strength
  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][
    strength
  ];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.data?.message || "Something went wrong.");
    }
  };

  // ── OTP input handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }
    // Just advance to password step — actual verification happens on final submit
    setStep("password");
  };

  // ── Step 3: reset password ──────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
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
      await verifyOtpReset({ email, otp: otp.join(""), newPassword }).unwrap();
      setStep("done");
    } catch (err: any) {
      // If OTP is wrong, send them back to OTP step
      const msg = err?.data?.message || "Something went wrong.";
      if (
        msg.toLowerCase().includes("otp") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
      }
      setError(msg);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await forgotPassword({ email }).unwrap();
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to resend OTP.");
    }
  };

  const stepMeta: Record<Step, { icon: any; title: string; subtitle: string }> =
    {
      email: {
        icon: Mail,
        title: "Forgot Password?",
        subtitle: "Enter your registered email to receive a reset OTP",
      },
      otp: {
        icon: ShieldCheck,
        title: "Enter OTP",
        subtitle: `We sent a 6-digit code to ${email}`,
      },
      password: {
        icon: KeyRound,
        title: "New Password",
        subtitle: "Choose a strong password for your account",
      },
      done: {
        icon: Check,
        title: "All Done!",
        subtitle: "Your password has been reset successfully",
      },
    };

  const meta = stepMeta[step];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Back */}
        {step !== "done" && (
          <motion.button
            onClick={() => {
              if (step === "email") navigate("/");
              else if (step === "otp") setStep("email");
              else if (step === "password") setStep("otp");
            }}
            whileHover={{ x: -3 }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            {step === "email" ? "Back to Login" : "Back"}
          </motion.button>
        )}

        <div className="backdrop-blur-2xl bg-gradient-to-br from-[rgba(26,31,46,0.95)] to-[rgba(15,20,25,0.90)] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Step progress bar */}
          {step !== "done" && (
            <div className="flex h-1">
              {["email", "otp", "password"].map((s, i) => {
                const stepIndex = ["email", "otp", "password"].indexOf(step);
                return (
                  <div
                    key={s}
                    className="flex-1 transition-all duration-500"
                    style={{
                      backgroundColor: i <= stepIndex ? "#3b82f6" : "#1e293b",
                    }}
                  />
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === "done" ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div
                  className={`p-2.5 rounded-xl border ${
                    step === "done"
                      ? "bg-green-500/15 border-green-500/25"
                      : "bg-blue-500/15 border-blue-500/25"
                  }`}
                >
                  <meta.icon
                    size={22}
                    className={
                      step === "done" ? "text-green-400" : "text-blue-400"
                    }
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white leading-tight">
                    {meta.title}
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {meta.subtitle}
                  </p>
                </div>
              </div>

              {/* ── Step: Email ── */}
              {step === "email" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium tracking-wide uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={sendingOtp}
                    whileHover={{ scale: sendingOtp ? 1 : 1.02 }}
                    whileTap={{ scale: sendingOtp ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {sendingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </motion.button>
                </form>
              )}

              {/* ── Step: OTP ── */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-4 font-medium tracking-wide uppercase text-center">
                      Enter the 6-digit code
                    </label>
                    <div
                      className="flex gap-2 justify-center"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={`w-11 h-13 text-center text-xl font-bold rounded-lg border bg-slate-900/80 text-white focus:outline-none transition-all ${
                            digit
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-700 focus:border-blue-500"
                          }`}
                          style={{ height: "52px" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      className="text-xs text-slate-400 hover:text-blue-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw size={12} />
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Verify OTP
                  </motion.button>
                </form>
              )}

              {/* ── Step: New Password ── */}
              {step === "password" && (
                <form onSubmit={handleReset} className="space-y-5">
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

                    {newPassword.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
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
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          {[
                            { label: "8+ characters", ok: checks.length },
                            { label: "Uppercase letter", ok: checks.upper },
                            { label: "Number", ok: checks.number },
                            { label: "Special character", ok: checks.special },
                          ].map(({ label, ok }) => (
                            <div
                              key={label}
                              className="flex items-center gap-1.5"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${ok ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-600"}`}
                              >
                                <Check size={9} strokeWidth={3} />
                              </div>
                              <span
                                className={`text-xs ${ok ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
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
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 &&
                      confirmPassword !== newPassword && (
                        <p className="text-xs text-red-400 mt-1.5">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={resetting}
                    whileHover={{ scale: resetting ? 1 : 1.02 }}
                    whileTap={{ scale: resetting ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {resetting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Reset Password
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* ── Step: Done ── */}
              {step === "done" && (
                <div className="flex flex-col items-center text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6"
                  >
                    <Check size={36} className="text-green-400" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Password Reset!
                  </h2>
                  <p className="text-slate-400 text-sm mb-8">
                    Your password has been changed. <br />
                    You can now log in with your new password.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    Go to Login
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          CampusVoice · Secure Password Reset
        </p>
      </motion.div>
    </div>
  );
}
