import { prisma } from "@/lib/prisma";
import type { Offer, OfferSource, OfferType, PriceUnit } from "@/generated/prisma/client";
import { getConnector } from "@/lib/connectors/registry";
import type { NormalizedBillingInterval, NormalizedProduct, NormalizedProductType } from "@/lib/connectors/types";
import { whopClientForCompany } from "@/lib/connectors/whop/client";
import { fetchAccountProfile } from "@/lib/connectors/whop/products";

export interface SyncResult {
  creatorId: string;
  status: "synced" | "skipped";
  offerCount?: number;
  error?: string;
}

const OFFER_TYPE: Record<NormalizedProductType, OfferType> = {
  membership: "MEMBERSHIP",
  course: "COURSE",
  coaching: "COACHING",
  consulting: "CONSULTING",
  free: "FREE",
  other: "OTHER",
};

/** Same precedence `lib/connectors/whop/products.ts`'s old priceUnitFor
 * used: free beats everything, then the billing interval, then a
 * consulting-specific PROJECT unit, else a flat one-time. Kept here
 * (rather than per-connector) since it's about how DM presents price,
 * not how any one platform reports it. */
function toPriceUnit(type: NormalizedProductType, billingInterval: NormalizedBillingInterval): PriceUnit {
  if (type === "free") return "FREE";
  if (billingInterval === "monthly") return "RECURRING_MONTH";
  if (billingInterval === "per_session") return "PER_SESSION";
  if (type === "consulting") return "PROJECT";
  return "ONE_TIME";
}

/** Platform -> Offer.source. Exported so app/api/dashboard/[companyId]/import-stream/route.ts
 * (which streams Whop products one at a time, rather than batching through
 * connector.getProducts, for the onboarding UX) can share the same mapping. */
export const OFFER_SOURCE: Record<string, OfferSource> = { whop: "WHOP" };

/** Re-fetches one creator's catalog (across every connected platform —
 * just Whop today) and, for Whop specifically, its account profile.
 * Account-profile refresh isn't part of the Connector contract (no other
 * platform has an equivalent concept yet), so it's handled directly here
 * rather than pretending it's generalized. Shared by the 6h cron
 * (app/api/sync/route.ts) and the manual "Re-sync now" action on the
 * dashboard (3A/3C). */
export async function syncCreator(creatorId: string): Promise<SyncResult> {
  const connections = await prisma.connection.findMany({ where: { creatorId, status: "connected" } });

  try {
    let offerCount = 0;
    let sortOrder = 0;

    for (const connection of connections) {
      if (connection.platform === "whop") {
        const client = whopClientForCompany();
        const profile = await fetchAccountProfile(client, connection.externalId);
        await prisma.creator.update({ where: { id: creatorId }, data: { verified: profile.verified } });
      }

      const connector = getConnector(connection.platform);
      const source = OFFER_SOURCE[connection.platform];
      if (!source) throw new Error(`No Offer source mapping for platform "${connection.platform}"`);

      const products = await connector.getProducts(connection.id);
      for (const product of products) {
        await upsertOffer(creatorId, source, product, sortOrder);
        sortOrder += 1;
        offerCount += 1;
      }

      await prisma.connection.update({ where: { id: connection.id }, data: { lastSyncedAt: new Date() } });
    }

    await prisma.creator.update({ where: { id: creatorId }, data: { lastSyncedAt: new Date() } });
    return { creatorId, status: "synced", offerCount };
  } catch (error) {
    return { creatorId, status: "skipped", error: error instanceof Error ? error.message : String(error) };
  }
}

/** Writes one normalized product to `Offer`, applying the same
 * connector-owned-fields-only update rule regardless of caller. Exported
 * for the import-stream route (see OFFER_SOURCE above). */
export async function upsertOffer(
  creatorId: string,
  source: OfferSource,
  product: NormalizedProduct,
  sortOrder: number,
): Promise<Offer> {
  const type = OFFER_TYPE[product.type];
  const priceUnit = toPriceUnit(product.type, product.billingInterval);

  const existing = await prisma.offer.findUnique({
    where: { creatorId_whopProductId: { creatorId, whopProductId: product.id } },
  });

  return prisma.offer.upsert({
    where: { creatorId_whopProductId: { creatorId, whopProductId: product.id } },
    create: {
      creatorId,
      source,
      whopProductId: product.id,
      name: product.name,
      priceCents: product.price,
      priceUnit,
      type,
      whopCheckoutUrl: product.checkoutUrl,
      // Prefill only on first import — description/thumbnail are creator-owned after this.
      description: product.description,
      thumbnailUrl: product.thumbnailUrl,
      sortOrder,
      lastSyncedAt: new Date(),
    },
    update: {
      // Only the fields the connector actually owns are ever overwritten by a sync.
      name: product.name,
      priceCents: product.price,
      priceUnit,
      whopCheckoutUrl: product.checkoutUrl,
      lastSyncedAt: new Date(),
      ...(existing ? {} : { type }),
    },
  });
}

/** Every creator, called by the 6h cron. Sequential with a small
 * concurrency cap — fine at pilot scale, revisit if the creator count grows. */
export async function syncAllCreators(): Promise<SyncResult[]> {
  const creators = await prisma.creator.findMany({ select: { id: true } });

  const results: SyncResult[] = [];
  const CONCURRENCY = 5;
  for (let i = 0; i < creators.length; i += CONCURRENCY) {
    const batch = creators.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map((c) => syncCreator(c.id)))));
  }
  return results;
}
