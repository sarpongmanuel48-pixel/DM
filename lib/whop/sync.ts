import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { whopClientForCreator } from "@/lib/whop/client";
import { fetchAccountProfile, fetchOffers, fetchOwnCompanyId } from "@/lib/whop/products";
import { refreshTokens } from "@/lib/whop/oauth";

export interface SyncResult {
  creatorId: string;
  status: "synced" | "expired" | "skipped";
  offerCount?: number;
  error?: string;
}

/** Re-fetches one connected creator's catalog and account profile from Whop.
 * Shared by the 6h cron (app/api/sync/route.ts) and the manual "Re-sync now"
 * actions on the dashboard (3A/3C) and the expired-connection screen (2E). */
export async function syncCreator(creatorId: string): Promise<SyncResult> {
  const creator = await prisma.creator.findUniqueOrThrow({ where: { id: creatorId } });

  if (creator.whopConnectionStatus === "DISCONNECTED") {
    return { creatorId, status: "skipped" };
  }
  if (!creator.whopAccessToken || !creator.whopRefreshToken) {
    await markExpired(creatorId);
    return { creatorId, status: "expired" };
  }

  try {
    const accessToken = await ensureFreshAccessToken(creator);
    const client = whopClientForCreator(accessToken);
    const companyId = creator.whopCompanyId ?? (await fetchOwnCompanyId(client));

    const [profile, offers] = await Promise.all([
      fetchAccountProfile(client, companyId),
      fetchOffers(client, companyId),
    ]);

    await prisma.$transaction(async (tx) => {
      await tx.creator.update({
        where: { id: creatorId },
        data: {
          whopConnectionStatus: "CONNECTED",
          whopCompanyId: profile.whopCompanyId,
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

    const offerCount = offers.length;
    return { creatorId, status: "synced", offerCount };
  } catch (error) {
    if (isAuthError(error)) {
      await markExpired(creatorId);
      return { creatorId, status: "expired" };
    }
    return { creatorId, status: "skipped", error: error instanceof Error ? error.message : String(error) };
  }
}

/** Every connected creator, called by the 6h cron. Sequential with a small
 * concurrency cap — fine at pilot scale, revisit if the creator count grows. */
export async function syncAllConnectedCreators(): Promise<SyncResult[]> {
  const creators = await prisma.creator.findMany({
    where: { whopConnectionStatus: "CONNECTED" },
    select: { id: true },
  });

  const results: SyncResult[] = [];
  const CONCURRENCY = 5;
  for (let i = 0; i < creators.length; i += CONCURRENCY) {
    const batch = creators.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map((c) => syncCreator(c.id)))));
  }
  return results;
}

/** Exported for the onboarding import stream (2B), which needs a valid
 * access token before it can stream products directly. */
export async function ensureFreshAccessToken(creator: {
  id: string;
  whopAccessToken: string | null;
  whopRefreshToken: string | null;
  whopTokenExpiresAt: Date | null;
}): Promise<string> {
  const expiresAt = creator.whopTokenExpiresAt;
  const needsRefresh = !expiresAt || expiresAt.getTime() < Date.now() + 60_000;
  if (!needsRefresh) return decryptToken(creator.whopAccessToken!);

  const refreshed = await refreshTokens(decryptToken(creator.whopRefreshToken!));
  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      whopAccessToken: encryptToken(refreshed.access_token),
      whopRefreshToken: encryptToken(refreshed.refresh_token),
      whopTokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
    },
  });
  return refreshed.access_token;
}

async function markExpired(creatorId: string): Promise<void> {
  await prisma.creator.update({
    where: { id: creatorId },
    data: { whopConnectionStatus: "EXPIRED" },
  });
}

function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /401|403|unauthor/i.test(message);
}
