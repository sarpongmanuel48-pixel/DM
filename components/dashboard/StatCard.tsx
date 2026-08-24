export function StatCard({
  label,
  value,
  hint,
  delta,
  muted,
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-hairline bg-white p-4.5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">{label}</div>
      <div
        className="font-display text-[30px] font-bold tracking-tight"
        style={{ color: muted ? "var(--ink-300)" : "var(--ink-900)" }}
      >
        {value}
      </div>
      {hint && <div className="text-xs text-ink-400">{hint}</div>}
      {delta && <div className="text-xs" style={{ color: delta.startsWith("-") ? "var(--ink-400)" : "var(--success)" }}>{delta}</div>}
    </div>
  );
}
