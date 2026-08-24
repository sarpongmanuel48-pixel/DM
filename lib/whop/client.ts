import { WhopClient } from "@whop/sdk";

/**
 * Reads a specific installed company's product catalog, and checks a
 * requesting user's access level against a company. One shared app-level
 * key covers every company that has installed DM and granted its declared
 * permissions at install time (product:basic:read, plan:basic:read — set
 * in the app's Developer → Permissions tab) — there is no per-creator
 * OAuth token to store, refresh, or expire.
 */
export function whopClientForCompany(): WhopClient {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new Error("WHOP_API_KEY is not set");
  return new WhopClient({ token: apiKey });
}

/** A client acting as DM's own Whop company — used only for DM Pro billing
 * (checkout/plan lookups), never for reading a creator's own catalog. This
 * is a genuinely separate Whop company/app from the one above; keep it a
 * separate credential rather than reusing WHOP_API_KEY, since it's acting
 * on DM's own account, not on behalf of an installed company. */
export function whopClientForDm(): WhopClient {
  const apiKey = process.env.WHOP_DM_API_KEY;
  if (!apiKey) throw new Error("WHOP_DM_API_KEY is not set");
  return new WhopClient({ token: apiKey });
}
