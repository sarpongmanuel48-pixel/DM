// 4C — shown while a creator is still setting up; never seen by real visitors.
export function PreviewBanner() {
  return (
    <div
      className="flex w-full items-center justify-center gap-2 px-4 py-3 text-center text-[11.5px] font-medium"
      style={{ background: "var(--warning-soft)", color: "#8a5a00", borderBottom: "1px solid rgba(217,138,0,.25)" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <path d="M12 8v5M12 16.5v.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
      Preview only — this page isn&apos;t public yet
    </div>
  );
}
