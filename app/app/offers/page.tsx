import { prisma } from "@/lib/prisma";
import { requireCreatorForPage } from "@/lib/standalone-auth";
import { OfferRow } from "@/components/dashboard/OfferRow";
import { EmptyOffersStandalone } from "@/components/dashboard/EmptyOffersStandalone";

/**
 * Standalone analogue of app/dashboard/[companyId]/offers/page.tsx.
 * A standalone creator has no connector this pass (see
 * lib/standalone-auth.ts's comments — creating a custom offer isn't built
 * yet), so creator.offers is always empty here and the non-empty branch
 * below (with its Whop-specific "mirrors Whop" copy) is intentionally
 * unreachable rather than incorrect — left in place for the day a create
 * flow exists, at which point this page stops being empty-only.
 */
export default async function StandaloneOffersPage() {
  const creatorId = (await requireCreatorForPage()).id;
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { id: creatorId },
    include: { offers: { orderBy: { sortOrder: "asc" } } },
  });

  if (creator.offers.length === 0) {
    return <EmptyOffersStandalone />;
  }

  const visibleCount = creator.offers.filter((o) => o.visible).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Offers</h1>
          <span className="whitespace-nowrap font-mono text-[11.5px] text-ink-400">
            {creator.offers.length} products · {visibleCount} visible
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-white">
        <div
          className="flex items-center gap-3.5 p-2.5 text-[9.5px] font-semibold uppercase tracking-widest text-ink-500"
          style={{ background: "var(--canvas)" }}
        >
          <span style={{ width: 36 }} className="flex-none" />
          <span className="min-w-0 flex-1">Name</span>
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
    </div>
  );
}
