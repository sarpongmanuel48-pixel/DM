import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCreatorByCompanyId } from "@/lib/whop/dashboard-auth";
import { daysAgo } from "@/lib/dates";
import { CopyButton } from "@/components/CopyButton";
import { ResyncButton } from "@/components/dashboard/ResyncButton";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { StatCard } from "@/components/dashboard/StatCard";
import { VisitsChart } from "@/components/dashboard/VisitsChart";

// 3A (+ 4D's first-run checklist).
export default async function DashboardHomePage({ params }: PageProps<"/dashboard/[companyId]/home">) {
  const { companyId } = await params;
  const creatorId = (await getCreatorByCompanyId(companyId))?.id;
  if (!creatorId) notFound();
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { id: creatorId },
    include: { offers: true },
  });

  const since = daysAgo(7);
  const prevSince = daysAgo(14);

  const [visitEvents, clickEvents, prevVisits, prevClicks, clicksByOffer] = await Promise.all([
    prisma.clickEvent.findMany({ where: { creatorId: creator.id, offerId: null, timestamp: { gte: since } }, select: { timestamp: true } }),
    prisma.clickEvent.count({ where: { creatorId: creator.id, offerId: { not: null }, timestamp: { gte: since } } }),
    prisma.clickEvent.count({ where: { creatorId: creator.id, offerId: null, timestamp: { gte: prevSince, lt: since } } }),
    prisma.clickEvent.count({ where: { creatorId: creator.id, offerId: { not: null }, timestamp: { gte: prevSince, lt: since } } }),
    prisma.clickEvent.groupBy({
      by: ["offerId"],
      where: { creatorId: creator.id, offerId: { not: null }, timestamp: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { offerId: "desc" } },
      take: 1,
    }),
  ]);

  const pageVisits = visitEvents.length;
  const offerClicks = clickEvents;
  const ctr = pageVisits > 0 ? (offerClicks / pageVisits) * 100 : 0;
  const isFirstRun = pageVisits === 0 && offerClicks === 0;

  const bestOffer = clicksByOffer[0]
    ? creator.offers.find((o) => o.id === clicksByOffer[0].offerId)
    : undefined;

  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const dayStart = daysAgo(6 - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return visitEvents.filter((v) => v.timestamp >= dayStart && v.timestamp < dayEnd).length;
  });

  const featuredOffer = creator.offers.find((o) => o.id === creator.featuredOfferId);
  const checklist = [
    { label: "Write your bio and tagline", done: Boolean(creator.bio && creator.tagline), href: `/dashboard/${companyId}/editor` },
    {
      label: featuredOffer ? `Add a thumbnail to ${featuredOffer.name}` : "Pick a featured offer",
      done: Boolean(featuredOffer?.thumbnailUrl),
      href: `/dashboard/${companyId}/editor`,
    },
    { label: "Share your page link", done: pageVisits > 0, href: undefined },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[25px] font-bold tracking-tight text-ink-900">
            Your page, last 7 days
          </h1>
          <div className="flex items-center gap-2 font-mono text-[13px] text-ink-500">
            dm.to/{creator.handle}
            <span className="text-ink-200">·</span>
            <CopyButton text={`https://dm.to/${creator.handle}`} className="text-blue-600" />
          </div>
        </div>
        <div className="flex flex-none gap-2.5">
          <Link href={`/${creator.handle}`} className="qbx-btn qbx-btn--utility">
            Preview live page
          </Link>
          <Link href={`/dashboard/${companyId}/editor`} className="qbx-btn qbx-btn--md qbx-btn--primary">
            Edit page
          </Link>
        </div>
      </div>

      {isFirstRun ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Page visits" value="—" hint="No visits yet" muted />
            <StatCard label="Offer clicks" value="—" hint="No clicks yet" muted />
            <StatCard label="Best offer" value="Needs data" hint="Ranks once clicks arrive" muted />
          </div>
          <OnboardingChecklist items={checklist} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Page visits" value={pageVisits} delta={percentDelta(pageVisits, prevVisits)} />
            <StatCard label="Offer clicks" value={offerClicks} delta={percentDelta(offerClicks, prevClicks)} />
            <StatCard label="Click-through rate" value={`${ctr.toFixed(1)}%`} />
          </div>
          <div className="grid grid-cols-[1.35fr_1fr] gap-3">
            <VisitsChart counts={dailyCounts} />
            <div className="flex flex-col gap-3.5 rounded-lg border border-hairline bg-white p-5">
              <div className="text-[13.5px] font-semibold text-ink-900">Best performing offer</div>
              {bestOffer ? (
                <div className="flex flex-col gap-1">
                  <div className="text-[14.5px] font-semibold text-ink-900">{bestOffer.name}</div>
                  <div className="font-mono text-[11.5px] text-ink-400">
                    {bestOffer.type.toLowerCase()}
                    {bestOffer.id === creator.featuredOfferId ? " · featured" : ""}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-ink-400">No clicks yet</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between rounded-lg border border-hairline bg-white p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center rounded-md"
            style={{ width: 32, height: 32, background: "var(--success-soft)", color: "var(--success)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11A8 8 0 0 0 6.3 5.7L4 8M4 4v4h4M4 13a8 8 0 0 0 13.7 5.3L20 16M20 20v-4h-4" />
            </svg>
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="text-[13.5px] font-semibold text-ink-900">Synced with Whop</div>
            <div className="font-mono text-[11.5px] text-ink-400">
              {creator.offers.length} products · last synced {creator.lastSyncedAt?.toLocaleString() ?? "never"} · next sync in 6h
            </div>
          </div>
        </div>
        <ResyncButton companyId={companyId} />
      </div>
    </div>
  );
}

function percentDelta(current: number, previous: number): string | undefined {
  if (previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prior 7 days`;
}
