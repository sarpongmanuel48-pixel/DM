import Link from "next/link";

// 4C's empty-offers card — CTA back to the editor.
export function EmptyOffersCard() {
  return (
    <div
      className="flex flex-col items-center gap-3.5 rounded-xl border border-dashed p-8 text-center"
      style={{ borderColor: "var(--hairline-strong)", background: "#fff" }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-md"
        style={{ background: "var(--canvas-soft)", color: "var(--ink-400)" }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M14 17.5h7M17.5 14v7" />
        </svg>
      </span>
      <div className="flex flex-col gap-1.5">
        <div className="font-display text-[17px] font-bold tracking-tight text-ink-900">No offers visible yet</div>
        <p className="max-w-[230px] text-[13px] text-ink-500">
          Turn an offer on in the editor, or publish a product on Whop and it lands here on the next sync.
        </p>
      </div>
      <Link href="/dashboard/editor" className="qbx-btn qbx-btn--accent qbx-btn--sm">
        Open the editor
      </Link>
    </div>
  );
}
