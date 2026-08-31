// Standalone analogue of EmptyOffersOnWhop — no connector to sync from, no
// re-sync action, no "create it on Whop" CTA. Adding a first custom offer
// isn't built yet (a real, separate gap — see lib/standalone-auth.ts's
// comments); this is an honest empty state, not one that implies a create
// flow exists.
export function EmptyOffersStandalone() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Offers</h1>
        <p className="text-[13.5px] text-ink-700">Nothing here yet.</p>
      </div>

      <div
        className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-14 text-center"
        style={{ borderColor: "var(--hairline-strong)", background: "#fff" }}
      >
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 52, height: 52, background: "var(--canvas)", color: "var(--ink-400)" }}
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
            <path d="M3 7l9 4 9-4M12 11v10" />
          </svg>
        </span>
        <div className="flex flex-col items-center gap-2">
          <div className="font-display text-xl font-bold tracking-tight text-ink-900">No offers yet</div>
          <p className="max-w-[420px] text-sm text-ink-700">
            Your page still shows your name, bio, and social links in the meantime.
          </p>
        </div>
      </div>
    </div>
  );
}
