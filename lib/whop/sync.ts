import { prisma } from "@/lib/prisma";
import { whopClientForCompany } from "@/lib/whop/client";
import { fetchAccountProfile, fetchOffers } from "@/lib/whop/products";

export interface SyncResult {
  creatorId: string;
  status: "synced" | "skipped";
  offerCount?: number;
  error?: string;
}

/** Re-fetches one connected creator's catalog and account profile from
 * Whop. Shared by the 6h cron (app/api/sync/route.ts) and the manual
 * "Re-sync now" action on the dashboard (3A/3C). No per-creator token to
 * refresh or expire — every request uses the app's single WHOP_API_KEY,
 * scoped by the permissions granted when the company installed DM. */
export async function syncCreator(creatorId: string): Promise<SyncResult> {
  const creator = await prisma.creator.findUniqueOrThrow({ where: { id: creatorId } });
  const client = whopClientForCompany();

  try {
    const [profile, offers] = await Promise.all([
      fetchAccountProfile(client, creator.whopCompanyId),
      fetchOffers(client, creator.whopCompanyId),
    ]);

    await prisma.$transaction(async (tx) => {
      await tx.creator.update({
        where: { id: creatorId },
        data: {
          verified: profile.verified,
          lastSyncedAt: new Date(),
        },
      });

      for (const [sortOrder, offer] of offers.entries()) {
        const existing = await tx.offer.findUnique({
          where: { creatorId_whopProductId: { creatorId, whopProductId: offer.whopProductId } },
        });

        await tx.offer.upsert({
          where: { creatorId_whopProductId: { creatorId, whopProductId: offer.whopProductId } },
          create: {
            creatorId,
            source: "WHOP",
            whopProductId: offer.whopProductId,
            name: offer.name,
            priceCents: offer.priceCents,
            priceUnit: offer.priceUnit,
            type: offer.type,
            whopCheckoutUrl: offer.whopCheckoutUrl,
            // Prefill only on first import — description/thumbnail are creator-owned after this.
            description: offer.description,
            thumbnailUrl: offer.thumbnailUrl,
            sortOrder,
            lastSyncedAt: new Date(),
          },
          update: {
            // Only the fields Whop actually owns are ever overwritten by a sync.
            name: offer.name,
            priceCents: offer.priceCents,
            priceUnit: offer.priceUnit,
            whopCheckoutUrl: offer.whopCheckoutUrl,
            lastSyncedAt: new Date(),
            ...(existing ? {} : { type: offer.type }),
          },
        });
      }
    });

    return { creatorId, status: "synced", offerCount: offers.length };
  } catch (error) {
    return { creatorId, status: "skipped", error: error instanceof Error ? error.message : String(error) };
  }
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
