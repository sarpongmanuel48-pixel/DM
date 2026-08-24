import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/components/CopyButton";

// 2D — Step 5: done.
export default async function OnboardingDonePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) redirect("/onboarding/connect");
  if (!creator.publishedAt) redirect("/onboarding/handle");

  const url = `dm.to/${creator.handle}`;

  return (
    <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "var(--navy-900)" }}>
      <div className="w-full max-w-[420px] rounded-lg text-center text-white">
        <div className="flex flex-col items-center gap-5 p-11">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: "rgba(255,255,255,.1)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l5 5L19 7" />
            </svg>
          </div>
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[27px] font-bold tracking-tight">Your page is live</h1>
            <p className="text-[14.5px]" style={{ color: "var(--text-on-dark-muted)" }}>
              Paste this link in your bio. Everything you sell on Whop is already on it.
            </p>
          </div>
          <div
            className="flex w-full items-center gap-2.5 rounded-md border px-4 py-3.5"
            style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.14)" }}
          >
            <span className="flex-1 text-left font-mono text-sm">{url}</span>
            <CopyButton text={`https://${url}`} className="text-xs font-medium" style={{ color: "rgba(255,255,255,.8)" }} />
          </div>
          <div className="mt-0.5 flex w-full flex-col gap-2.5">
            <Link href={`/${creator.handle}`} className="qbx-btn qbx-btn--lg qbx-btn--inverse" style={{ width: "100%" }}>
              View my live page
            </Link>
            <Link href="/dashboard/home" className="py-3 text-sm font-medium" style={{ color: "rgba(255,255,255,.7)" }}>
              Go to dashboard
            </Link>
          </div>
          <div
            className="flex w-full items-center justify-between pt-4.5 font-mono text-[11.5px]"
            style={{ borderTop: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.45)" }}
          >
            <span>synced just now</span>
            <span>next sync in 6h</span>
          </div>
        </div>
      </div>
    </main>
  );
}
