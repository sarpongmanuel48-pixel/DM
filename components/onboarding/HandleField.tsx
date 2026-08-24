"use client";

import { useEffect, useState } from "react";

/** 2C's live availability check — debounced against /api/handle-availability. */
export function HandleField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [checkResult, setCheckResult] = useState<{ handle: string; available: boolean } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!value) return;
    const timeout = setTimeout(async () => {
      setChecking(true);
      const res = await fetch(`/api/handle-availability?handle=${encodeURIComponent(value)}`);
      const data = (await res.json()) as { available: boolean };
      setCheckResult({ handle: value, available: data.available });
      setChecking(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [value]);

  const status = !value
    ? "idle"
    : checking
      ? "checking"
      : checkResult?.handle === value
        ? checkResult.available
          ? "available"
          : "unavailable"
        : "idle";

  return (
    <div className="qbx-field">
      <span className="qbx-label">Your page address</span>
      <div
        className="flex items-center overflow-hidden rounded-md border bg-white"
        style={{ borderColor: "var(--border-strong)", boxShadow: status === "available" ? "var(--focus-ring)" : undefined }}
      >
        <span className="pl-3 py-2.5 font-mono text-sm text-ink-400">dm.to/</span>
        <input
          name={name}
          required
          pattern="[a-z0-9][a-z0-9-]{0,28}[a-z0-9]?"
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase())}
          className="flex-1 py-2.5 pr-3 font-mono text-sm outline-none"
          placeholder="yourhandle"
        />
        {status === "available" && (
          <span className="flex items-center gap-1.5 pr-3.5 text-xs font-medium" style={{ color: "var(--success)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l5 5L19 7" />
            </svg>
            Available
          </span>
        )}
        {status === "unavailable" && (
          <span className="pr-3.5 text-xs font-medium" style={{ color: "var(--danger)" }}>
            Taken
          </span>
        )}
      </div>
      <span className="qbx-field__hint">Letters, numbers and dashes. You can change it later in Settings.</span>
    </div>
  );
}
