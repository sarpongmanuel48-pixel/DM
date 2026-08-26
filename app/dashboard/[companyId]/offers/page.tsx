import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCreatorByCompanyId } from "@/lib/whop/dashboard-auth";
import { ResyncButton } from "@/components/dashboard/ResyncButton";
import { OfferRow } from "@/components/dashboard/OfferRow";
import { EmptyOffersOnWhop } from "@/components/dashboard/EmptyOffersOnWhop";

// 3C — synced (read-only) vs. editable columns, plus 4E's empty state.
export default async function OffersPage({ params }: PageProps<"/dashboard/[companyId]/offers">) {
  const { companyId } = await params;
  const creatorId = (await getCreatorByCompanyId(companyId))?.id;
  if (!creatorId) notFound();
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { id: creatorId },
    include: { offers: { orderBy: { sortOrder: "asc" } } },
  });

  if (creator.offers.length === 0) {
    return <EmptyOffersOnWhop companyId={companyId} lastSyncedAt={creator.lastSyncedAt} />;
  }

  const visibleCount = creator.offers.filter((o) => o.visible).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Everything from Whop</h1>
          <p className="max-w-[560px] text-[13.5px] text-ink-700">
            Name and price mirror Whop and can&apos;t be edited here. Type, description and
            visibility are yours.
          </p>
        </div>
        <div className="flex flex-none items-center gap-3">
          <span className="whitespace-nowrap font-mono text-[11.5px] text-ink-400">
            {creator.offers.length} products · {visibleCount} visible
          </span>
          <ResyncButton companyId={companyId} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-white">
        <div
          className="flex items-center gap-3.5 p-2.5 text-[9.5px] font-semibold uppercase tracking-widest text-ink-500"
          style={{ background: "var(--canvas)" }}
        >
          <span style={{ width: 36 }} className="flex-none" />
          <span className="min-w-0 flex-1">From Whop</span>
          <span className="flex-none" style={{ width: 110 }}>
            Type
          </span>
          <span className="flex-none" style={{ width: 200 }}>
            Description
          </span>
          <span className="flex-none" style={{ width: 90 }}>
            Last synced
          </span>
          <span className="flex-none text-right" style={{ width: 36 }}>
            Visible
          </span>
        </div>
        {creator.offers.map((offer) => (
          <OfferRow
            key={offer.id}
            offer={{
              id: offer.id,
              name: offer.name,
              type: offer.type,
              priceCents: offer.priceCents,
              priceUnit: offer.priceUnit,
              description: offer.description,
              lastSyncedAt: offer.lastSyncedAt?.toISOString() ?? null,
              visible: offer.visible,
              isFeatured: offer.id === creator.featuredOfferId,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2.5 text-xs text-ink-500">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v.5M12 11.5V16" />
        </svg>
        Created something new on Whop? It appears here after the next sync — or hit Re-sync now.
      </div>
    </div>
  );
}
