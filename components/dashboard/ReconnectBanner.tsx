import Link from "next/link";

// 2E — the page stays live on last-synced data; sync status flips to Paused.
export function ReconnectBanner({ lastSyncedAt }: { lastSyncedAt: Date | null }) {
  return (
    <div
      className="flex items-start gap-4 rounded-lg border p-4.5 shadow-sm"
      style={{ borderColor: "var(--danger)" }}
    >
      <span
        className="flex flex-none items-center justify-center rounded-full"
        style={{ width: 34, height: 34, background: "var(--danger-soft)", color: "var(--danger)" }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v5M12 16.5v.5" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="font-display text-[17px] font-bold tracking-tight text-ink-900">
          Your Whop connection expired
        </div>
        <div className="mt-1.5 max-w-[520px] text-sm text-ink-700">
          Your page is still live and showing what we last synced
          {lastSyncedAt ? ` on ${lastSyncedAt.toLocaleDateString()}` : ""}. Price and product changes you
          make on Whop won&apos;t appear until you reconnect.
        </div>
      </div>
      <div className="flex flex-none flex-col items-stretch gap-2">
        <Link href="/api/whop/connect" className="qbx-btn qbx-btn--md qbx-btn--primary">
          Reconnect Whop
        </Link>
        <span className="text-center text-xs text-ink-400">Takes 20 seconds</span>
      </div>
    </div>
  );
}
