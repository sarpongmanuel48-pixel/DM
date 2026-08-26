import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCreatorByCompanyId } from "@/lib/whop/dashboard-auth";
import { daysAgo } from "@/lib/dates";
import { VisitsChart } from "@/components/dashboard/VisitsChart";

const SOURCE_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  DIRECT: "Direct / hidden by browser",
  OTHER: "Other",
};

// 3D — page views over time, clicks per offer ranked with CTR, traffic
// source breakdown, and the honestly-labeled "Handoffs to Whop" counter.
export default async function AnalyticsPage({ params }: PageProps<"/dashboard/[companyId]/analytics">) {
  const { companyId } = await params;
  const creatorId = (await getCreatorByCompanyId(companyId))?.id;
  if (!creatorId) notFound();
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { id: creatorId },
    include: { offers: true },
  });

  const since = daysAgo(30);

  const [visitEvents, offerClicks, sourceCounts] = await Promise.all([
    prisma.clickEvent.findMany({ where: { creatorId: creator.id, offerId: null, timestamp: { gte: daysAgo(7) } }, select: { timestamp: true } }),
    prisma.clickEvent.groupBy({
      by: ["offerId"],
      where: { creatorId: creator.id, offerId: { not: null }, timestamp: { gte: since } },
      _count: { _all: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["sourceBucket"],
      where: { creatorId: creator.id, timestamp: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const totalVisits = await prisma.clickEvent.count({ where: { creatorId: creator.id, offerId: null, timestamp: { gte: since } } });
  const handoffs = offerClicks.reduce((sum, row) => sum + row._count._all, 0);

  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const dayStart = daysAgo(6 - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return visitEvents.filter((v) => v.timestamp >= dayStart && v.timestamp < dayEnd).length;
  });

  const offerRows = offerClicks
    .map((row) => {
      const offer = creator.offers.find((o) => o.id === row.offerId);
      return offer ? { offer, clicks: row._count._all } : null;
    })
    .filter((r): r is { offer: (typeof creator.offers)[number]; clicks: number } => r !== null)
    .sort((a, b) => b.clicks - a.clicks);

  const totalSourceEvents = sourceCounts.reduce((sum, r) => sum + r._count._all, 0) || 1;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Analytics</h1>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3">
        <VisitsChart counts={dailyCounts} />
        <div className="flex flex-col justify-center gap-1 rounded-lg border border-hairline bg-white p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Handoffs to Whop</div>
          <div className="font-display text-[32px] font-bold tracking-tight text-ink-900">{handoffs}</div>
          <p className="text-xs text-ink-500">
            Taps that reached a Whop checkout page — not confirmed sales. What happens after checkout is reported in Whop.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-white">
        <div className="border-b border-hairline p-4.5 text-[13.5px] font-semibold text-ink-900">
          Clicks per offer, last 30 days
        </div>
        {offerRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-400">No offer clicks yet.</div>
        ) : (
          offerRows.map(({ offer, clicks }) => (
            <div key={offer.id} className="flex items-center gap-3 p-3.5" style={{ borderTop: "1px solid var(--hairline)" }}>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-ink-900">{offer.name}</div>
                <div className="font-mono text-[11px] text-ink-400">
                  {clicks} click{clicks === 1 ? "" : "s"} · {totalVisits > 0 ? `${((clicks / totalVisits) * 100).toFixed(1)}% CTR` : "—"}
                </div>
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--canvas-soft)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(clicks / offerRows[0].clicks) * 100}%`, background: "var(--action-primary)" }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-lg border border-hairline bg-white">
        <div className="border-b border-hairline p-4.5">
          <div className="text-[13.5px] font-semibold text-ink-900">Traffic sources</div>
          <p className="mt-0.5 text-xs text-ink-500">
            In-app browsers (Instagram, TikTok) often hide the referrer — those show as &quot;Direct / hidden by
            browser,&quot; not zero traffic.
          </p>
        </div>
        {sourceCounts.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-400">No traffic yet.</div>
        ) : (
          sourceCounts
            .sort((a, b) => b._count._all - a._count._all)
            .map((row) => (
              <div key={row.sourceBucket} className="flex items-center gap-3 p-3.5" style={{ borderTop: "1px solid var(--hairline)" }}>
                <div className="w-40 flex-none text-[13px] text-ink-800">{SOURCE_LABEL[row.sourceBucket] ?? row.sourceBucket}</div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--canvas-soft)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(row._count._all / totalSourceEvents) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
                <div className="w-10 flex-none text-right font-mono text-[11px] text-ink-400">{row._count._all}</div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
