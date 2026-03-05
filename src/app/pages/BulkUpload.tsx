import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  UserPlus,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  Users,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import {
  useCreateUserMutation,
  useBulkCreateUsersMutation,
  type CreateUserPayload,
  type BulkRowResult,
  type BulkUploadResponse,
} from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "single" | "bulk";

interface ParsedRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "student" | "staff";
  errors: string[];
}

// ─── CSV Template ─────────────────────────────────────────────────────────────
const CSV_HEADERS = ["name", "email", "password", "role"];
const CSV_SAMPLE = [
  ["Alice Johnson", "alice@college.edu", "Pass@1234", "student"],
  ["Dr. Sarah Connor", "sarah@college.edu", "Pass@5678", "staff"],
  ["Bob Smith", "bob@college.edu", "Pass@9999", "student"],
];

function generateCSV(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ─── Validators ───────────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw: string) {
  return !!pw && pw.length >= 6;
}
function validateRow(row: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!row.name?.trim()) errors.push("Name is required");
  if (!validateEmail(row.email)) errors.push("Invalid email");
  if (!validatePassword(row.password))
    errors.push("Password must be ≥ 6 chars");
  if (!["student", "staff"].includes(row.role?.toLowerCase()))
    errors.push("Role must be 'student' or 'staff'");
  return errors;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
        ok
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-red-500/20 text-red-400 border-red-500/30"
      }`}
    >
      {ok ? "Valid" : "Error"}
    </span>
  );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-slate-900/50 border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-1 ${
    err
      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
      : "border-slate-700/50 focus:border-blue-500/60 focus:ring-blue-500/20"
  }`;

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertTriangle size={15} className="shrink-0" />
      {message}
    </div>
  );
}

// ─── Single Upload Form ───────────────────────────────────────────────────────
function SingleForm() {
  const [form, setForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [createUser, { isLoading }] = useCreateUserMutation();

  const setField = (k: keyof CreateUserPayload, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => {
      const e = { ...p };
      delete e[k];
      return e;
    });
    setApiError(null);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (!validateEmail(form.email)) e.email = "Enter a valid email";
    if (!validatePassword(form.password))
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setFieldErrors(e);
      return;
    }
    setApiError(null);
    try {
      await createUser(form).unwrap();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ name: "", email: "", password: "", role: "student" });
      }, 3000);
    } catch (err: any) {
      setApiError(
        err?.data?.message ?? "Failed to create user. Please try again.",
      );
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">User Created!</p>
          <p className="text-slate-400 text-sm mt-1">
            <span className="text-white">{form.name || "User"}</span> registered
            as <span className="capitalize text-blue-400">{form.role}</span>.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="single-form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {apiError && (
        <div className="sm:col-span-2">
          <ErrorBanner message={apiError} />
        </div>
      )}

      <Field
        label="Full Name"
        icon={<User size={15} />}
        error={fieldErrors.name}
      >
        <input
          type="text"
          value={form.name ?? ""}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Alice Johnson"
          className={inputCls(fieldErrors.name)}
        />
      </Field>

      <Field
        label="Email Address"
        icon={<Mail size={15} />}
        error={fieldErrors.email}
      >
        <input
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="alice@college.edu"
          className={inputCls(fieldErrors.email)}
        />
      </Field>

      <Field
        label="Password"
        icon={<Lock size={15} />}
        error={fieldErrors.password}
      >
        <input
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="Min. 6 characters"
          className={`${inputCls(fieldErrors.password)} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShowPw((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </Field>

      <Field label="Role" icon={<Users size={15} />}>
        <div className="relative">
          <select
            value={form.role ?? "student"}
            onChange={(e) => setField("role", e.target.value)}
            className={`${inputCls()} appearance-none pr-8 pl-9`}
          >
            <option value="student" className="bg-slate-900">
              Student
            </option>
            <option value="staff" className="bg-slate-900">
              Staff
            </option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
      </Field>

      <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-700/30 mt-2">
        <button
          onClick={() => {
            setForm({ name: "", email: "", password: "", role: "student" });
            setFieldErrors({});
            setApiError(null);
          }}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Creating…
            </>
          ) : (
            <>
              <UserPlus size={15} /> Create User
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Bulk Upload Form ─────────────────────────────────────────────────────────
function BulkForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [bulkCreateUsers, { isLoading }] = useBulkCreateUsersMutation();

  const parseCSV = useCallback((text: string): ParsedRow[] => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];
    const hdrs = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map((v) => v.trim());
      const data: Record<string, string> = {};
      hdrs.forEach((h, idx) => (data[h] = vals[idx] ?? ""));
      return {
        id: i + 1,
        name: data.name ?? "",
        email: data.email ?? "",
        password: data.password ?? "",
        role: (data.role?.toLowerCase() as "student" | "staff") ?? "student",
        errors: validateRow(data),
      };
    });
  }, []);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) return;
    setFile(f);
    setResult(null);
    setApiError(null);
    const reader = new FileReader();
    reader.onload = (e) => setRows(parseCSV(e.target?.result as string));
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (!valid.length) return;
    setApiError(null);
    try {
      const payload: CreateUserPayload[] = valid.map(
        ({ name, email, password, role }) => ({
          name,
          email,
          password,
          role,
        }),
      );
      const res = await bulkCreateUsers(payload).unwrap();
      setResult(res);
    } catch (err: any) {
      setApiError(
        err?.data?.message ?? "Bulk import failed. Please try again.",
      );
    }
  };

  const reset = () => {
    setFile(null);
    setRows([]);
    setResult(null);
    setApiError(null);
  };
  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errCount = rows.filter((r) => r.errors.length > 0).length;

  const downloadTemplate = () => {
    const csv = generateCSV(CSV_HEADERS, CSV_SAMPLE);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users_template.csv";
    a.click();
  };

  // Result screen
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 size={22} className="text-green-400" />
          <h3 className="text-base font-semibold text-white">
            Import Complete
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {result.imported}
            </p>
            <p className="text-xs text-slate-400 mt-1">Imported</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{result.failed}</p>
            <p className="text-xs text-slate-400 mt-1">Failed</p>
          </div>
        </div>

        {/* Per-row server feedback */}
        {result.results?.length > 0 && (
          <div className="rounded-xl border border-slate-700/40 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-700/40">
              <span className="text-xs font-semibold text-white">
                Row Results
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-700/30">
              {result.results.map((r: BulkRowResult) => (
                <div
                  key={r.row}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs ${r.success ? "" : "bg-red-500/5"}`}
                >
                  <span className="text-slate-500 w-5">{r.row}</span>
                  {r.success ? (
                    <CheckCircle2
                      size={12}
                      className="text-green-400 shrink-0"
                    />
                  ) : (
                    <AlertCircle size={12} className="text-red-400 shrink-0" />
                  )}
                  <span className="text-slate-300 truncate flex-1">
                    {r.email}
                  </span>
                  {r.error && (
                    <span className="text-red-400 truncate max-w-[160px]">
                      {r.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <RefreshCw size={13} /> Upload another file
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="bulk-form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {apiError && <ErrorBanner message={apiError} />}

      {/* Drop zone + info */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => !file && fileRef.current?.click()}
          className={`md:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-8 transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-500/10 cursor-copy"
              : file
                ? "border-green-500/40 bg-green-500/5 cursor-default"
                : "border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-800/40 cursor-pointer"
          }`}
          style={{ minHeight: 180 }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          {file ? (
            <>
              <FileText size={32} className="text-green-400 mb-2" />
              <p className="text-white font-medium text-sm">{file.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {rows.length} rows parsed
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={11} /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                <Upload size={20} className="text-blue-400" />
              </div>
              <p className="text-white text-sm font-medium mb-0.5">
                Drop CSV here
              </p>
              <p className="text-slate-500 text-xs">or click to browse</p>
            </>
          )}
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="rounded-xl bg-slate-900/40 border border-slate-700/40 p-4">
            <p className="text-xs font-semibold text-white mb-1">
              Required Columns
            </p>
            <code className="text-xs text-blue-400 leading-6 block">
              {CSV_HEADERS.join(", ")}
            </code>
            <p className="text-xs text-slate-500 mt-2 mb-3">
              Role: <span className="text-slate-300">student</span> or{" "}
              <span className="text-slate-300">staff</span>
            </p>
            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 text-xs rounded-lg transition-all"
            >
              <Download size={12} /> Download Sample CSV
            </button>
          </div>
          {rows.length > 0 && (
            <div className="rounded-xl bg-slate-900/40 border border-slate-700/40 p-4 space-y-2">
              {[
                { label: "Total", value: rows.length, color: "text-white" },
                { label: "Valid", value: validCount, color: "text-green-400" },
                { label: "Errors", value: errCount, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className={`font-semibold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700/40 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between bg-slate-900/40">
            <span className="text-xs font-semibold text-white">Preview</span>
            <div className="flex gap-3 text-xs">
              <span className="text-green-400">{validCount} valid</span>
              <span className="text-red-400">{errCount} errors</span>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm">
                <tr>
                  {["#", "Status", "Name", "Email", "Role", "Issues"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <>
                    <tr
                      key={row.id}
                      className={`border-t border-slate-700/25 hover:bg-slate-700/20 transition-colors ${row.errors.length ? "bg-red-500/5" : ""}`}
                    >
                      <td className="px-3 py-2 text-slate-500">{row.id}</td>
                      <td className="px-3 py-2">
                        <StatusBadge ok={row.errors.length === 0} />
                      </td>
                      <td className="px-3 py-2 text-slate-300 max-w-[120px] truncate">
                        {row.name || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-300 max-w-[160px] truncate">
                        {row.email || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${row.role === "staff" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
                        >
                          {row.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {row.errors.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === row.id ? null : row.id,
                              )
                            }
                            className="flex items-center gap-1 text-red-400 hover:text-red-300"
                          >
                            <AlertCircle size={11} /> {row.errors.length}
                            <ChevronDown
                              size={11}
                              className={`transition-transform ${expandedRow === row.id ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRow === row.id && row.errors.length > 0 && (
                      <tr className="bg-red-500/5 border-t border-red-500/10">
                        <td colSpan={6} className="px-3 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {row.errors.map((err, i) => (
                              <span
                                key={i}
                                className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded"
                              >
                                {err}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            disabled={isLoading || validCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Importing…
              </>
            ) : (
              <>
                <Upload size={15} /> Import {validCount} User
                {validCount !== 1 ? "s" : ""}
              </>
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [mode, setMode] = useState<Mode>("single");

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
        <div className="relative z-10 p-4 md:p-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
              Add Users
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Register students and staffs individually or via CSV import
            </p>
          </motion.div>

          {/* Mode toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-6"
          >
            <div className="inline-flex p-1 rounded-xl bg-slate-800/50 border border-slate-700/40 gap-1">
              {[
                {
                  key: "single" as Mode,
                  icon: <UserPlus size={15} />,
                  label: "Single User",
                },
                {
                  key: "bulk" as Mode,
                  icon: <Upload size={15} />,
                  label: "Bulk CSV",
                },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === key ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                  {mode === key && (
                    <motion.div
                      layoutId="mode-pill"
                      className="absolute inset-0 bg-blue-600/40 border border-blue-500/50 rounded-lg"
                      transition={{ type: "spring", duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10">{icon}</span>
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-slate-800/20 border border-slate-700/40 p-5 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/40">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                {mode === "single" ? (
                  <UserPlus size={18} className="text-blue-400" />
                ) : (
                  <FileText size={18} className="text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="text-sm md:text-base font-semibold text-white">
                  {mode === "single"
                    ? "Create Single User"
                    : "Bulk Import via CSV"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === "single"
                    ? "POST /api/admin/users"
                    : "POST /api/admin/users/bulk"}
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {mode === "single" ? (
                <SingleForm key="single" />
              ) : (
                <BulkForm key="bulk" />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Schema reference */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/30 flex flex-wrap items-center gap-x-6 gap-y-1"
          >
            <p className="text-xs text-slate-500 font-medium">Schema fields:</p>
            {[
              { field: "name", note: "optional" },
              { field: "email", note: "required · unique" },
              { field: "password", note: "required · bcrypt hashed" },
              { field: "role", note: "student | staff  (default: student)" },
            ].map(({ field, note }) => (
              <div key={field} className="flex items-center gap-1.5">
                <code className="text-xs text-blue-400">{field}</code>
                <span className="text-xs text-slate-600">{note}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
