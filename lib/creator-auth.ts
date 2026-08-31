import { prisma } from "@/lib/prisma";
import { requireCompanyAdmin, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { auth } from "@/lib/auth";
import type { Creator } from "@/generated/prisma/client";

/**
 * Authorizes a request against a specific creatorId regardless of which
 * platform that creator is connected through. SaveIdentityForm and
 * AppearanceForm are shared between the Whop-embedded and standalone
 * dashboards (both render the same components), but requireAdminForCreator
 * (lib/whop/dashboard-auth.ts) only ever looks up a "whop" connection —
 * it throws for a standalone creator's own edits since they only have a
 * "standalone" connection. This dispatches to whichever check applies.
 */
export async function requireAdminForCreatorAnyPlatform(
  creatorId: string,
  requestHeaders: Headers,
): Promise<Creator> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    include: { connections: true },
  });
  if (!creator) {
    throw new DashboardAuthError(`No creator ${creatorId}`, "not_admin");
  }

  const whopConnection = creator.connections.find((c) => c.platform === "whop");
  if (whopConnection) {
    await requireCompanyAdmin(whopConnection.externalId, requestHeaders);
    return creator;
  }

  const standaloneConnection = creator.connections.find((c) => c.platform === "standalone");
  if (standaloneConnection) {
    const session = await auth();
    if (session?.user?.email !== standaloneConnection.externalId) {
      throw new DashboardAuthError(`Not authorized for creator ${creatorId}`, "not_admin");
    }
    return creator;
  }

  throw new DashboardAuthError(`No creator ${creatorId}`, "not_admin");
}
