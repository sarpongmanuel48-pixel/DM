export function VisitsChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  const today = new Date();
  const labels = counts.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (counts.length - 1 - i));
    return String(d.getDate());
  });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-white p-5">
      <div className="flex items-baseline justify-between">
        <div className="text-[13.5px] font-semibold text-ink-900">Visits per day</div>
      </div>
      <div className="flex items-end gap-2.5" style={{ height: 104 }}>
        {counts.map((count, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${Math.max(4, (count / max) * 100)}%`,
              background: i >= counts.length - 2 ? "var(--action-primary)" : "var(--blue-100)",
            }}
            title={`${count} visits`}
          />
        ))}
      </div>
      <div className="flex gap-2.5 font-mono text-[10.5px] text-ink-300">
        {labels.map((label, i) => (
          <span key={i} className="flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
