import { prisma } from "@/lib/prisma";
import type { Connector, NormalizedProduct } from "@/lib/connectors/types";
import { whopClientForCompany } from "@/lib/connectors/whop/client";
import { fetchProducts } from "@/lib/connectors/whop/products";

/**
 * The creator-facing Whop connector — reads a connected company's product
 * catalog. Not to be confused with `lib/whop/dashboard-auth.ts` (verifying
 * the embedded-host iframe token) or `lib/whop/{webhooks,checkout}.ts`
 * (DM's own Whop-as-payment-processor billing) — see CLAUDE.md.
 */
export const whopConnector: Connector = {
  platform: "whop",

  /** DM never runs a real OAuth handshake for Whop — a company installs
   * the app from Whop's App Store, and the resulting `x-whop-user-token`
   * request is what `getOrCreateCreator` (lib/whop/dashboard-auth.ts)
   * calls this with. Just records the Connection; there's no external
   * round-trip to make. */
  async connect(params: unknown): Promise<{ connectionId: string }> {
    const { creatorId, companyId } = params as { creatorId: string; companyId: string };
    const connection = await prisma.connection.upsert({
      where: { creatorId_platform: { creatorId, platform: "whop" } },
      create: {
        creatorId,
        platform: "whop",
        credentialType: "app_install",
        externalId: companyId,
        status: "connected",
      },
      update: { externalId: companyId, status: "connected" },
    });
    return { connectionId: connection.id };
  },

  /** Soft-disconnect only — there's no per-creator OAuth token to revoke
   * (every company shares the app-level WHOP_API_KEY, scoped by the
   * permissions granted at install). Stops sync from touching it. */
  async disconnect(connectionId: string): Promise<void> {
    await prisma.connection.update({ where: { id: connectionId }, data: { status: "disconnected" } });
  },

  async getProducts(connectionId: string): Promise<NormalizedProduct[]> {
    const connection = await prisma.connection.findUniqueOrThrow({ where: { id: connectionId } });
    const client = whopClientForCompany();
    return fetchProducts(client, connection.externalId, connectionId);
  },

  // Whop's API doesn't expose creator-facing analytics today — omitted
  // entirely (getAnalytics is optional on the Connector contract).

  /** No creator-level Whop webhook exists yet — catalog changes are
   * picked up by the 6h cron and the manual "Re-sync now" action, not
   * real-time push. (DM's own Whop billing webhook, a different concern,
   * is verified separately in lib/whop/webhooks.ts.) */
  async verifyWebhook(): Promise<boolean> {
    return false;
  },
};
