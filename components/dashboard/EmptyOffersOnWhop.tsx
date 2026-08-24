import Link from "next/link";
import { ResyncButton } from "@/components/dashboard/ResyncButton";

// 4E — connected but the Whop account has zero published products yet.
export function EmptyOffersOnWhop({ companyId, lastSyncedAt }: { companyId: string; lastSyncedAt: Date | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Everything from Whop</h1>
        <p className="text-[13.5px] text-ink-700">Nothing to show yet — your Whop account has no published products.</p>
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
          <div className="font-display text-xl font-bold tracking-tight text-ink-900">No products on Whop yet</div>
          <p className="max-w-[420px] text-sm text-ink-700">
            Create a membership, course, or free download on Whop. It appears here — and on your page — on the next sync.
          </p>
        </div>
        <div className="flex gap-2.5">
          <a href="https://whop.com" target="_blank" rel="noreferrer" className="qbx-btn qbx-btn--md qbx-btn--primary">
            Create a product on Whop
          </a>
          <ResyncButton companyId={companyId} />
        </div>
        <div className="font-mono text-[11.5px] text-ink-300">
          last checked {lastSyncedAt?.toLocaleString() ?? "never"} · checks every 6h
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-hairline bg-white p-4">
        <span className="mt-0.5 flex-none text-ink-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v.5M12 11.5V16" />
          </svg>
        </span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-ink-900">Your page still works</div>
          <div className="mt-0.5 text-[12.5px] text-ink-700">
            Visitors see your name, bio and social links. Offers appear the moment you have one.
          </div>
        </div>
        <Link href={`/dashboard/${companyId}/home`} className="flex-none whitespace-nowrap text-[12.5px] font-medium text-blue-600">
          Preview page
        </Link>
      </div>
    </div>
  );
}
