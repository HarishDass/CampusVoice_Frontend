import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = "#2563eb",
  height = 10,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm text-slate-400">
          <span>{progress}%</span>
        </div>
      )}

      <div
        className="w-full bg-slate-700/40 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
          }}
        />
      </div>
    </div>
  );
}
export function GlassCard({
  children,
  className = "",
  glowColor = "#2563eb",
  hover = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.01, transition: { duration: 0.2 } } : {}}
      className={`relative backdrop-blur-xl bg-gradient-to-br from-[rgba(26,31,46,0.9)] to-[rgba(26,31,46,0.7)] rounded-xl p-6 shadow-xl border border-slate-700/50 ${hover ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: string;
  trend?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  color,
  trend,
}: StatCardProps) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50">
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </GlassCard>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#2563eb",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
}
