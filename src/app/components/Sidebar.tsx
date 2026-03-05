import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  LogOut,
  Zap,
  ClipboardList,
  MicVocal,
  Menu,
  X,
} from "lucide-react";
import { useLogoutMutation } from "../../services/api";

interface SidebarProps {
  role: "citizen" | "admin" | "staff";
}

export function Sidebar({ role }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const citizenLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
    { icon: FileText, label: "Submit Issue", path: "/submit" },
    { icon: ClipboardList, label: "My Issues", path: "/track" },
  ];

  const staffLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/staff" },
    { icon: ClipboardList, label: "Assigned Issues", path: "/staff/issues" },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: ClipboardList, label: "All Issues", path: "/admin/issues" },
    { icon: Zap, label: "Escalated", path: "/admin/escalated" },
    { icon: TrendingUp, label: "Analytics", path: "/admin/analytics" },
  ];

  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {}
    localStorage.clear();
    navigate("/");
  };

  const links =
    role === "citizen"
      ? citizenLinks
      : role === "admin"
        ? adminLinks
        : staffLinks;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shrink-0">
            <MicVocal size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">CampusVoice</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {role === "citizen"
                ? "Student"
                : role === "admin"
                  ? "Admin"
                  : "Staff"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <motion.button
              key={link.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick(link.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId={`activeIndicator-${role}`}
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 flex-col backdrop-blur-xl bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] border-r border-slate-700/50 z-40">
        <SidebarContent />
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0f1419]/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <MicVocal size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-base">CampusVoice</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile top bar spacer (pushes page content down) ── */}
      <div className="md:hidden h-[57px]" />

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 flex flex-col bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] border-r border-slate-700/50 z-50"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
