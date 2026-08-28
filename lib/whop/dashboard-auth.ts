import { importJWK, jwtVerify } from "jose";
import { whopClientForCompany } from "@/lib/connectors/whop/client";
import { getCreatorByExternalId } from "@/lib/connectors/registry";
import { prisma } from "@/lib/prisma";
import type { Creator } from "@/generated/prisma/client";

/**
 * DM's dashboard is an embedded Whop app — there is no DM login screen.
 * Whop tells us who's looking via the x-whop-user-token header on every
 * request; we verify it, then confirm that user is an admin on the company
 * (companyId, from the /dashboard/[companyId] route segment) before
 * showing anything. Route structure and this exact verify → checkAccess
 * pattern confirmed against Whop's current developer docs
 * (docs.whop.com/developer/guides/app-views).
 *
 * The token-verification piece is ported from Whop's own official
 * @whop/sdk source (lib/verify-user-token.ts, present in v0.0.3 — the
 * version their docs snippets were written against, since removed from
 * the current published v1.0.13's `verifyUserToken` docs example, which
 * doesn't exist as an SDK method in what's actually installed). Verified
 * by downloading the real 0.0.3 tarball from npm and reading the source
 * directly — same ES256 verification, same public key, same issuer, same
 * claim shape (sub → userId, aud → appId). The public key below is
 * exactly that — public — safe to have in source; it verifies Whop's
 * signature, it doesn't sign anything.
 */

const USER_TOKEN_HEADER_NAME = "x-whop-user-token";
const USER_TOKEN_VERIFICATION_KEY = {
  kty: "EC",
  x: "rz8a8vxvexHC0TLT91g7llOdDOsNuYiGEfic4Qhni-E",
  y: "zH0QblKYToexd5PEIMGXPVJS9AB5smKrW4S_TbiXrOs",
  crv: "P-256",
} as const;

export class DashboardAuthError extends Error {
  constructor(
    message: string,
    public readonly reason: "unverified" | "not_admin",
  ) {
    super(message);
  }
}

/**
 * Verifies the x-whop-user-token header against Whop's public key and
 * returns the authenticated userId. Throws on anything invalid — missing
 * header, bad signature, wrong issuer, or (when WHOP_APP_ID is set) an
 * audience that doesn't match this app.
 */
async function verifyWhopUserToken(requestHeaders: Headers): Promise<{ userId: string }> {
  const tokenString = requestHeaders.get(USER_TOKEN_HEADER_NAME);
  if (!tokenString) {
    throw new DashboardAuthError(
      "No x-whop-user-token header present — this route must be loaded inside the Whop dashboard iframe",
      "unverified",
    );
  }

  const key = await importJWK(USER_TOKEN_VERIFICATION_KEY, "ES256");
  const { payload } = await jwtVerify(tokenString, key, {
    issuer: "urn:whopcom:exp-proxy",
  }).catch(() => {
    throw new DashboardAuthError("Whop user token failed signature/issuer verification", "unverified");
  });

  if (!payload.sub || !payload.aud || Array.isArray(payload.aud)) {
    throw new DashboardAuthError("Whop user token missing expected claims (sub/aud)", "unverified");
  }

  const expectedAppId = process.env.WHOP_APP_ID;
  if (expectedAppId && payload.aud !== expectedAppId) {
    throw new DashboardAuthError("Whop user token was issued for a different app", "unverified");
  }

  return { userId: payload.sub };
}

/**
 * Verifies the requesting Whop user and confirms admin access to
 * `companyId`. Throws DashboardAuthError on failure — callers (pages,
 * layouts) should let this throw and render/redirect accordingly, never
 * treat a failed check as "no creator yet."
 */
export async function requireCompanyAdmin(
  companyId: string,
  requestHeaders: Headers,
): Promise<{ whopUserId: string }> {
  // Local-dev-only bypass, safe by construction rather than by remembering
  // to unset something: both conditions are required, and neither can hold
  // in a real deployment. NODE_ENV is "development" only under `next dev` —
  // never in a production build/start — and "dev-test" isn't a real Whop
  // company id (those are "biz_..."), so this stays inert for every actual
  // request even if NODE_ENV were somehow misconfigured. See prisma/seed.ts
  // for the Creator/Connection row this id resolves to.
  if (process.env.NODE_ENV === "development" && companyId === "dev-test") {
    return { whopUserId: "dev-test-user" };
  }

  const { userId } = await verifyWhopUserToken(requestHeaders);

  // {id, resource_id} as a single object — matches the installed SDK's
  // real CheckAccessUsersRequest type (verified against node_modules).
  const client = whopClientForCompany();
  const access = await client.users.checkAccess({ id: userId, resource_id: companyId });
  if (access.access_level !== "admin") {
    throw new DashboardAuthError(`User ${userId} is not an admin on ${companyId}`, "not_admin");
  }

  return { whopUserId: userId };
}

/**
 * The main entry point for every dashboard page: verify the request, then
 * load (or note the absence of) this company's Creator record — resolved
 * via their "whop" Connection, not a direct field on Creator (see
 * lib/connectors/registry.ts).
 */
export async function getCurrentCreator(
  companyId: string,
  requestHeaders: Headers,
): Promise<{ whopUserId: string; creator: Creator | null }> {
  const { whopUserId } = await requireCompanyAdmin(companyId, requestHeaders);
  const creator = await getCreatorByExternalId("whop", companyId);

  // Keep whopUserId fresh — it's how the DM Pro billing webhook correlates
  // a membership purchase back to a Creator (see lib/whop/webhooks.ts).
  if (creator && creator.whopUserId !== whopUserId) {
    await prisma.creator.update({ where: { id: creator.id }, data: { whopUserId } });
  }

  return { whopUserId, creator };
}

/**
 * For routes that act on a resource owned by a creator (an offer, a link)
 * rather than a companyId in the URL — looks up the creator, verifies the
 * requester is an admin on that creator's Whop company, and returns it.
 * Throws DashboardAuthError on any failure, including a creatorId that
 * doesn't exist (reported as "not_admin" — same response either way, no
 * need to leak which one).
 */
export async function requireAdminForCreator(creatorId: string, requestHeaders: Headers): Promise<Creator> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    include: { connections: { where: { platform: "whop" } } },
  });
  const whopConnection = creator?.connections[0];
  if (!creator || !whopConnection) {
    throw new DashboardAuthError(`No creator ${creatorId}`, "not_admin");
  }
  await requireCompanyAdmin(whopConnection.externalId, requestHeaders);
  return creator;
}

/**
 * Thin, Whop-specific wrapper over `getCreatorByExternalId` — every
 * /dashboard/[companyId] page and API route resolves its creator this way
 * (in place of the old `prisma.creator.findUnique({ where: { whopCompanyId } })`).
 */
export async function getCreatorByCompanyId(companyId: string): Promise<Creator | null> {
  return getCreatorByExternalId("whop", companyId);
}

/**
 * Called the first time a verified admin is seen for a company with no
 * Creator row yet. Idempotent — an existing row is returned as-is. Creates
 * the Creator and its "whop" Connection together in one transaction rather
 * than going through `whopConnector.connect()` (lib/connectors/whop/index.ts)
 * — that method can't participate in this transaction (the Connector
 * contract has no transaction-client parameter), and without atomicity a
 * transient failure between the two writes would orphan a Creator row and
 * produce a duplicate on retry.
 */
export async function getOrCreateCreator(companyId: string, whopUserId: string): Promise<Creator> {
  const existing = await getCreatorByExternalId("whop", companyId);
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.create({
      data: {
        whopUserId,
        name: "",
        handle: crypto.randomUUID().slice(0, 8), // placeholder — claimed for real in first-run setup
      },
    });
    await tx.connection.create({
      data: {
        creatorId: creator.id,
        platform: "whop",
        credentialType: "app_install",
        externalId: companyId,
        status: "connected",
      },
    });
    return creator;
  });
}
