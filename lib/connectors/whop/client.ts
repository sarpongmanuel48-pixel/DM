import { WhopClient } from "@whop/sdk";

/**
 * Reads a specific installed company's product catalog, and checks a
 * requesting user's access level against a company. One shared app-level
 * key covers every company that has installed DM and granted its declared
 * permissions at install time (product:basic:read, plan:basic:read — set
 * in the app's Developer → Permissions tab) — there is no per-creator
 * OAuth token to store, refresh, or expire.
 *
 * This is the creator-facing connector's client — DM's own Whop-as-payment-
 * processor client (`whopClientForDm`) lives in `lib/whop/client.ts`, a
 * genuinely separate concern (see CLAUDE.md).
 */
export function whopClientForCompany(): WhopClient {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new Error("WHOP_API_KEY is not set");
  return new WhopClient({ token: apiKey });
}
