import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCreatorByExternalId } from "@/lib/connectors/registry";
import type { Creator } from "@/generated/prisma/client";

export class StandaloneAuthError extends Error {}

/**
 * Standalone analogue of getOrCreateCreator (lib/whop/dashboard-auth.ts:
 * 164-187) — same idempotent check-then-transact shape, Creator +
 * Connection created together so a transient failure can't orphan one
 * without the other. Unlike Whop, there's no import-then-publish
 * onboarding step here (no connector to import a catalog from), so
 * publishedAt is set immediately — the empty page is live from the start,
 * not gated behind a first-run wizard. Called once, from app/app/layout.tsx
 * — mirrors exactly where getOrCreateCreator is called from the Whop layout.
 */
export async function getOrCreateStandaloneCreator(email: string): Promise<Creator> {
  const existing = await getCreatorByExternalId("standalone", email);
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.create({
      data: {
        name: "",
        handle: crypto.randomUUID().slice(0, 8), // placeholder — claimed for real in Settings
        publishedAt: new Date(),
      },
    });
    await tx.connection.create({
      data: {
        creatorId: creator.id,
        platform: "standalone",
        credentialType: "session",
        externalId: email,
        status: "connected",
      },
    });
    return creator;
  });
}

/** Pure read, session → Creator, no creation. Standalone analogue of
 * getCreatorByCompanyId — every /app/* page uses this (the layout has
 * already created the row via getOrCreateStandaloneCreator by the time
 * any page renders). */
export async function getCreatorBySession(): Promise<Creator | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return getCreatorByExternalId("standalone", session.user.email);
}

/** For Server Components (pages) only — redirect() only works during
 * rendering, not in Route Handlers. Defensive: the layout already gates
 * access, this just mirrors that in case a page is ever reached directly. */
export async function requireCreatorForPage(): Promise<Creator> {
  const creator = await getCreatorBySession();
  if (!creator) redirect("/sign-in");
  return creator;
}

/** For Route Handlers (API routes), which bypass the layout's gate
 * entirely and can't use redirect() — throws instead, same shape as
 * DashboardAuthError in lib/whop/dashboard-auth.ts (catch → 401 JSON). */
export async function requireCreatorForApi(): Promise<Creator> {
  const creator = await getCreatorBySession();
  if (!creator) throw new StandaloneAuthError("Not signed in");
  return creator;
}
