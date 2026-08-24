const STEPS = ["Sign up", "Connect Whop", "Import", "Customize"];

export function StepHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline bg-white px-6 py-3.5">
      <div className="font-display text-[15px] font-bold tracking-widest text-ink-900">DM</div>
      <div className="flex items-center gap-3.5 text-xs font-medium text-ink-400">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const state = step < current ? "done" : step === current ? "active" : "pending";
          return (
            <span key={label} className="flex items-center gap-1.5" style={{ color: state === "pending" ? undefined : "var(--ink-900)" }}>
              <span
                className="flex items-center justify-center rounded-full text-[9px] font-semibold"
                style={{
                  width: 16,
                  height: 16,
                  background: state === "done" ? "var(--success-soft)" : state === "active" ? "var(--action-primary)" : "transparent",
                  color: state === "done" ? "var(--success)" : state === "active" ? "#fff" : "var(--ink-400)",
                  border: state === "pending" ? "1px solid var(--hairline-strong)" : undefined,
                }}
              >
                {state === "done" ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l5 5L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              {label}
            </span>
          );
        })}
      </div>
      <div className="text-xs text-ink-400">Step {current} of 4</div>
    </div>
  );
}
