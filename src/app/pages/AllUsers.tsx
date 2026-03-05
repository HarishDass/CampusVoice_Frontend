import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Eye,
  Mail,
  X,
  UserPlus,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import moment from "moment";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  type UserRecord,
  type GetUsersParams,
} from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleFilter = "all" | "student" | "staff";
type SortKey = "name" | "email" | "role" | "createdAt";
const PER_PAGE = 10;

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, role }: { name?: string; role: string }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color =
    role === "staff"
      ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
      : "bg-blue-500/20 border-blue-500/30 text-blue-400";
  return (
    <div
      className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${
        role === "staff"
          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
          : role === "admin"
            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
      }`}
    >
      {role === "staff" ? <Users size={10} /> : <GraduationCap size={10} />}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-slate-700/30">
      {[140, 180, 80, 80, 70].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div
            className="h-4 bg-slate-700/40 rounded animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
      <td className="px-5 py-3.5">
        <div className="h-4 w-4 bg-slate-700/40 rounded animate-pulse" />
      </td>
    </tr>
  );
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({
  open,
  onToggle,
  onView,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-50 w-36 rounded-xl bg-[#0f1419] border border-slate-700/60 shadow-2xl overflow-hidden"
          >
            {[
              {
                icon: Eye,
                label: "View",
                fn: onView,
                cls: "text-slate-300 hover:bg-slate-700/50",
              },
              {
                icon: Trash2,
                label: "Delete",
                fn: onDelete,
                cls: "text-red-400 hover:bg-red-500/10",
              },
            ].map(({ icon: Icon, label, fn, cls }) => (
              <button
                key={label}
                onClick={(e) => {
                  e.stopPropagation();
                  fn();
                  onToggle();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${cls}`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User Drawer ──────────────────────────────────────────────────────────────
function UserDrawer({
  user,
  onClose,
}: {
  user: UserRecord;
  onClose: () => void;
}) {
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const handleDelete = async () => {
    if (!confirm(`Delete ${user.name ?? user.email}?`)) return;
    await deleteUser(user._id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-[#0c1117] border border-slate-700/60 shadow-2xl overflow-hidden"
      >
        <div
          className={`h-1.5 w-full ${user.role === "staff" ? "bg-gradient-to-r from-purple-600 to-purple-400" : "bg-gradient-to-r from-blue-600 to-blue-400"}`}
        />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                user.role === "staff"
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                  : "bg-blue-500/20 border-blue-500/40 text-blue-400"
              }`}
            >
              {(user.name ?? "?")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">
                {user.name ?? (
                  <span className="italic text-slate-500">No name</span>
                )}
              </p>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Email</p>
              <p className="text-sm text-white break-all">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Registered</p>
              <p className="text-sm text-white">
                {moment(user.createdAt).format("DD MMM YYYY · h:mm A")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Last Updated</p>
              <p className="text-sm text-white">
                {moment(user.updatedAt).fromNow()}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/60 border border-slate-700/30 px-3 py-2">
            <p className="text-xs text-slate-500 mb-0.5">MongoDB _id</p>
            <code className="text-xs text-slate-400 break-all">{user._id}</code>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}) {
  // Windowed page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <div className="px-4 md:px-5 py-3.5 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-slate-500">
        {total === 0 ? "No results" : `${from}–${to} of ${total} users`}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`el-${i}`}
              className="w-7 text-center text-xs text-slate-600"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-7 h-7 rounded-lg text-xs transition-all ${
                page === p
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={onNext}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ViewAllUsersPage() {
  const navigate = useNavigate();

  // ── Every state value below maps 1-to-1 with a server query param ────────────
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchInput, setSearchInput] = useState(""); // controlled input (instant)
  const [search, setSearch] = useState(""); // debounced → sent to server
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // ── UI-only — never touches the query ────────────────────────────────────────
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // ── Debounce search: update input instantly, hit server only after 400 ms ────
  const handleSearchInput = (v: string) => {
    setSearchInput(v);
    clearTimeout((window as any).__userSearchTimer);
    (window as any).__userSearchTimer = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  };

  // ── Main paginated query — changes on any filter / sort / page change ─────────
  const mainParams: GetUsersParams = {
    page,
    limit: PER_PAGE,
    sort: sortKey,
    order: sortDir,
    ...(roleFilter !== "all" && { role: roleFilter }),
    ...(search.trim() && { search: search.trim() }),
  };
  const { data, isLoading, isFetching, isError, refetch } =
    useGetUsersQuery(mainParams);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ── Stat-card counts: three tiny parallel queries (limit:1), fully cached ────
  // RTK Query deduplicates these — they fire once and never again unless
  // the "Users" tag is invalidated (e.g. after a delete or create).
  const { data: allData } = useGetUsersQuery({ limit: 1 });
  const { data: studentData } = useGetUsersQuery({ role: "student", limit: 1 });
  const { data: staffData } = useGetUsersQuery({ role: "staff", limit: 1 });

  const counts = {
    all: allData?.total ?? 0,
    student: studentData?.total ?? 0,
    staff: staffData?.total ?? 0,
  };

  // ── Sort ──────────────────────────────────────────────────────────────────────
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ── Role filter — resets page ─────────────────────────────────────────────────
  const setFilter = (r: RoleFilter) => {
    setRoleFilter(r);
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp size={11} />
      ) : (
        <ChevronDown size={11} />
      )
    ) : (
      <ChevronDown size={11} className="opacity-25" />
    );

  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />

      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        <div
          className="fixed inset-0 md:ml-64 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.3) 1px,transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
                User Management
              </h1>
              <p className="text-slate-400 text-sm">
                View and manage all registered students and staff
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/admin/upload")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all font-medium"
              >
                <UserPlus size={15} /> Add Users
              </motion.button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl transition-all">
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className={`flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl transition-all ${isFetching ? "opacity-60" : ""}`}
              >
                <RefreshCw
                  size={14}
                  className={isFetching ? "animate-spin" : ""}
                />
              </button>
            </div>
          </motion.div>

          {/* Stat cards — counts come from the three tiny cached queries */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3 mb-5"
          >
            {[
              {
                key: "all" as RoleFilter,
                label: "Total Users",
                color: "text-white",
                bg: "border-slate-700/40 bg-slate-800/20",
              },
              {
                key: "student" as RoleFilter,
                label: "Students",
                color: "text-blue-400",
                bg: "border-blue-500/20 bg-blue-500/5",
              },
              {
                key: "staff" as RoleFilter,
                label: "Staff",
                color: "text-purple-400",
                bg: "border-purple-500/20 bg-purple-500/5",
              },
            ].map(({ key, label, color, bg }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-xl border p-3 md:p-4 text-left transition-all ${bg} ${
                  roleFilter === key
                    ? "ring-1 ring-blue-500/40"
                    : "hover:border-slate-600"
                }`}
              >
                {isLoading ? (
                  <div className="h-7 w-10 bg-slate-700/40 rounded animate-pulse mb-1" />
                ) : (
                  <p className={`text-xl md:text-2xl font-bold ${color}`}>
                    {counts[key]}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </button>
            ))}
          </motion.div>

          {/* Error */}
          {isError && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle size={15} /> Failed to load users.{" "}
              <button
                onClick={() => refetch()}
                className="underline hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search + role pill filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-5"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              {/* Spinner while debounced request is in-flight */}
              {isFetching && !isLoading && (
                <Loader2
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin"
                />
              )}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/40 border border-slate-700/40">
              {(["all", "student", "staff"] as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    roleFilter === r
                      ? "bg-blue-600/40 text-blue-300 border border-blue-500/40"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Table card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl bg-slate-800/20 border border-slate-700/40 overflow-hidden"
          >
            {/* ── Mobile card list ── */}
            <div className="block md:hidden">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/30 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700/40" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-700/40 rounded w-32" />
                      <div className="h-3 bg-slate-700/40 rounded w-48" />
                    </div>
                    <div className="h-5 w-16 bg-slate-700/40 rounded-full" />
                  </div>
                ))
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No users found.
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/30 hover:bg-slate-700/20 transition-all cursor-pointer ${isFetching ? "opacity-50" : ""}`}
                  >
                    <Avatar name={user.name} role={user.role} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user.name ?? (
                          <span className="italic text-slate-500">No name</span>
                        )}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                    <RoleBadge role={user.role} />
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        open={openMenu === user._id}
                        onToggle={() =>
                          setOpenMenu(openMenu === user._id ? null : user._id)
                        }
                        onView={() => setSelectedUser(user)}
                        onDelete={() => setSelectedUser(user)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/40 bg-slate-900/40">
                    {[
                      { key: "name" as SortKey, label: "User" },
                      { key: "email" as SortKey, label: "Email" },
                      { key: "role" as SortKey, label: "Role" },
                      { key: "createdAt" as SortKey, label: "Joined" },
                    ].map(({ key, label }) => (
                      <th key={key} className="px-5 py-3.5 text-left">
                        <button
                          onClick={() => toggleSort(key)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 font-medium hover:text-white transition-colors"
                        >
                          {label} <SortIcon k={key} />
                        </button>
                      </th>
                    ))}
                    <th className="px-5 py-3.5 text-left text-xs text-slate-400 font-medium">
                      Last Updated
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                {/*
                  Dim the body while a background fetch is running so the user
                  knows stale data is being refreshed — no flicker, no spinner wall.
                */}
                <tbody
                  className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-50" : "opacity-100"}`}
                >
                  {isLoading ? (
                    Array.from({ length: PER_PAGE }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-slate-500 text-sm"
                      >
                        No users match your filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} role={user.role} />
                            <p className="text-white font-medium">
                              {user.name ?? (
                                <span className="italic text-slate-500 font-normal">
                                  No name
                                </span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-slate-400 text-sm flex items-center gap-1.5">
                            <Mail
                              size={12}
                              className="text-slate-600 shrink-0"
                            />
                            {user.email}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">
                          {moment(user.createdAt).format("DD MMM YYYY")}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                          {moment(user.updatedAt).fromNow()}
                        </td>
                        <td
                          className="px-5 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionMenu
                            open={openMenu === user._id}
                            onToggle={() =>
                              setOpenMenu(
                                openMenu === user._id ? null : user._id,
                              )
                            }
                            onView={() => setSelectedUser(user)}
                            onDelete={() => setSelectedUser(user)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
              onPage={(p) => setPage(p)}
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>

      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
