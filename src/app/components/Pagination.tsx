
interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: Props) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-700/50">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="text-slate-300">
          {start}–{end}
        </span>{" "}
        of <span className="text-slate-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 hover:border-slate-600 transition-all"
        >
          ← Prev
        </button>

        <div className="flex gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 py-1.5 text-slate-500 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p as number)}
                className={`min-w-[32px] px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  page === p
                    ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/20"
                    : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 hover:border-slate-600 transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
