import { prisma } from "@/lib/prisma";
import type { Creator } from "@/generated/prisma/client";
import type { Connector } from "@/lib/connectors/types";
import { whopConnector } from "@/lib/connectors/whop";

/** Platform name -> connector instance. The single lookup point — nothing
 * outside `lib/connectors/` should import a platform SDK directly. */
const connectors: Record<string, Connector> = {
  whop: whopConnector,
};

export function getConnector(platform: string): Connector {
  const connector = connectors[platform];
  if (!connector) throw new Error(`No connector registered for platform "${platform}"`);
  return connector;
}

/** Resolves a Creator via their `Connection` to a platform + the platform's
 * own id for them (e.g. a Whop company id) — the generalized replacement
 * for the old `prisma.creator.findUnique({ where: { whopCompanyId } })`
 * lookup. Returns null if no such connection exists. */
export async function getCreatorByExternalId(platform: string, externalId: string): Promise<Creator | null> {
  const connection = await prisma.connection.findUnique({
    where: { platform_externalId: { platform, externalId } },
    include: { creator: true },
  });
  return connection?.creator ?? null;
}
