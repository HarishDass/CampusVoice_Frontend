import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLoginMutation } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [login] = useLoginMutation();

  const token = localStorage.getItem("accessToken");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---------- Manual Login ---------- */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res: any = await login({ email, password }).unwrap();

      const role = res?.user?.role;

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("role", role);

      if (role === "student") navigate("/student");
      if (role === "staff") navigate("/staff");
      if (role === "admin") navigate("/admin");
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1747499967281-c0c5eec9933c"
            alt="City Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-[rgba(26,31,46,0.95)] to-[rgba(26,31,46,0.85)] rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">CampusVoice</h1>
            <p className="text-sm text-slate-400 uppercase">
              Be Heard . Be Resolved
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white"
                placeholder="Enter your password"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 mt-6"
            >
              Access Platform
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
