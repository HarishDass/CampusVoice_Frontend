import { motion } from "motion/react";
import { Loader2, AlertCircle, FileText, Users } from "lucide-react";

// Full Page Loader - Main loader for initial app load
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e] flex items-center justify-center z-50">
      {/* Animated background */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 text-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <FileText className="text-white" size={40} />
          </div>
        </motion.div>

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="text-blue-400 mx-auto" size={48} />
        </motion.div>

        {/* Loading text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Loading Grievance Portal
        </motion.h2>

        {/* Animated dots */}
        <motion.p className="text-slate-400 flex items-center justify-center gap-1">
          <span>Please wait</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          >
            .
          </motion.span>
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto max-w-xs"
        />
      </div>
    </div>
  );
}

// Spinner Loader - Small inline loader
export function SpinnerLoader({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Loader2 className="text-blue-400" size={size} />
    </motion.div>
  );
}

// Dots Loader - Three bouncing dots
export function DotsLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className="w-3 h-3 bg-blue-500 rounded-full"
        />
      ))}
    </div>
  );
}

// Pulse Loader - Pulsing circle
export function PulseLoader() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
      />
    </div>
  );
}

// Card Skeleton Loader - For loading cards
export function CardSkeleton() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-3/4" />
          <div className="h-3 bg-slate-700/50 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700/50 rounded" />
        <div className="h-3 bg-slate-700/50 rounded w-5/6" />
      </div>
    </div>
  );
}

// Table Skeleton Loader
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-700/50 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700/50 rounded w-1/4" />
              <div className="h-3 bg-slate-700/50 rounded w-1/3" />
            </div>
            <div className="h-8 w-24 bg-slate-700/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Circular Progress Loader
export function CircularProgress({ progress = 0 }: { progress?: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5 }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
}

// Overlay Loader - Covers content while loading
export function OverlayLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 className="text-blue-400 mx-auto" size={40} />
        </motion.div>
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
}

// Linear Progress Bar
export function LinearProgress({ progress = 0, indeterminate = false }: { progress?: number; indeterminate?: boolean }) {
  if (indeterminate) {
    return (
      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: "50%" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// Loading Button State
export function ButtonLoader({ loading = false, children, ...props }: any) {
  return (
    <button
      disabled={loading}
      className="relative px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={18} />
        </motion.div>
      )}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
    </button>
  );
}

// Content Placeholder Loader (for text content)
export function ContentPlaceholder({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-700/50 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? "70%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

// Icon Loader - Animated icon for specific contexts
export function IconLoader({ icon: Icon = FileText }: { icon?: any }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Icon className="text-blue-400" size={48} />
    </motion.div>
  );
}

// Skeleton Screen - Full page skeleton
export function SkeletonScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-700/50 rounded w-1/4" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Table skeleton */}
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

// Animated Logo Loader
export function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50"
      >
        <FileText className="text-white" size={32} />
      </motion.div>
      <DotsLoader />
    </div>
  );
}

export default {
  FullPageLoader,
  SpinnerLoader,
  DotsLoader,
  PulseLoader,
  CardSkeleton,
  TableSkeleton,
  CircularProgress,
  OverlayLoader,
  LinearProgress,
  ButtonLoader,
  ContentPlaceholder,
  IconLoader,
  SkeletonScreen,
  LogoLoader,
};