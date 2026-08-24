import Link from "next/link";
import { StepHeader } from "@/components/onboarding/StepHeader";

const CAN = [
  "Read your products — names, prices, types, and thumbnails",
  "Read your account name and avatar, to prefill your page",
  "Check for changes on a schedule, so a price you edit on Whop updates here",
];
const CANNOT = [
  "Create, edit, or delete anything in your Whop account",
  "Touch payments or payouts — checkout always happens on Whop",
];

// 2A — Step 2: Connect Whop.
export default async function ConnectWhopPage({ searchParams }: PageProps<"/onboarding/connect">) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-canvas">
      <StepHeader current={2} />
      <div className="flex justify-center px-6 py-11">
        <div className="flex w-full max-w-[520px] flex-col gap-5.5">
          {error && (
            <div className="rounded-md p-3 text-center text-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
              {error === "state_mismatch"
                ? "That connection link expired — try again."
                : "Couldn't connect to Whop — try again."}
            </div>
          )}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex items-center gap-3.5">
              <div
                className="flex items-center justify-center rounded-md font-display text-[17px] font-bold tracking-widest text-white"
                style={{ width: 46, height: 46, background: "var(--navy-900)" }}
              >
                DM
              </div>
              <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="var(--ink-300)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8h20M17 3.5L21.5 8 17 12.5" />
              </svg>
              <div
                className="flex items-center justify-center rounded-md border font-mono text-[10px] font-semibold text-ink-500"
                style={{ width: 46, height: 46, background: "var(--canvas-soft)", borderColor: "var(--hairline)", textAlign: "center", lineHeight: 1.2 }}
              >
                WHOP
              </div>
            </div>
            <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-900">
              Connect your Whop account
            </h1>
            <p className="max-w-[420px] text-[15px] text-ink-700">
              DM reads the products you already sell on Whop and lays them out as your page —
              nothing on your Whop setup changes.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-hairline bg-white">
            <div className="border-b border-hairline p-4.5 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
              DM will be able to
            </div>
            <div className="flex flex-col p-1.5">
              {CAN.map((item, i) => (
                <div key={item} className="flex items-start gap-2.5 p-2.5" style={{ borderTop: i > 0 ? "1px solid var(--hairline)" : undefined }}>
                  <span className="mt-0.5 flex-none" style={{ color: "var(--success)" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l5 5L19 7" />
                    </svg>
                  </span>
                  <div className="text-sm text-ink-800">{item}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 border-t border-hairline p-4.5" style={{ background: "var(--canvas)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">DM will never</div>
              {CANNOT.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-none text-ink-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M5.6 5.6l12.8 12.8" />
                    </svg>
                  </span>
                  <div className="text-[13.5px] text-ink-700">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Link href="/api/whop/connect" className="qbx-btn qbx-btn--lg qbx-btn--primary" style={{ width: "100%" }}>
              Continue to Whop
            </Link>
            <span className="text-sm text-ink-500">You&apos;ll sign in on Whop and come straight back.</span>
            <span className="font-mono text-[11.5px] text-ink-300">Disconnect any time in Settings → Connections</span>
          </div>
        </div>
      </div>
    </main>
  );
}
