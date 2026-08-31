import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreatorForPage } from "@/lib/standalone-auth";
import { daysAgo } from "@/lib/dates";
import { CopyButton } from "@/components/CopyButton";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { StatCard } from "@/components/dashboard/StatCard";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { buttonVariants } from "@/components/ui/button";

/**
 * Standalone analogue of app/dashboard/[companyId]/home/page.tsx — same
 * stats/checklist, session-based identity instead of a companyId route
 * param. The "Synced with Whop" panel is dropped entirely: a standalone
 * creator has no connector, so there's nothing to sync.
 */
export default async function StandaloneHomePage() {
  const creatorId = (await requireCreatorForPage()).id;
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
    { label: "Write your bio and tagline", done: Boolean(creator.bio && creator.tagline), href: "/app/editor" },
    {
      label: featuredOffer ? `Add a thumbnail to ${featuredOffer.name}` : "Pick a featured offer",
      done: Boolean(featuredOffer?.thumbnailUrl),
      href: "/app/editor",
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
          <Link href={`/${creator.handle}`} className={buttonVariants({ variant: "utility" })}>
            Preview live page
          </Link>
          <Link href="/app/editor" className={buttonVariants({ variant: "default" })}>
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
    </div>
  );
}

function percentDelta(current: number, previous: number): string | undefined {
  if (previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prior 7 days`;
}
