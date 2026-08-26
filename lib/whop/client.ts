import { WhopClient } from "@whop/sdk";

/** A client acting as DM's own Whop company — used only for DM Pro billing
 * (checkout/plan lookups), never for reading a creator's own catalog. This
 * is a genuinely separate Whop company/app from the one a creator installs;
 * keep it a separate credential rather than reusing WHOP_API_KEY, since
 * it's acting on DM's own account, not on behalf of an installed company.
 *
 * The creator-facing catalog client (`whopClientForCompany`) lives in
 * `lib/connectors/whop/client.ts` — that one's the actual connector; this
 * one is DM's own vendor relationship with Whop (see CLAUDE.md). */
export function whopClientForDm(): WhopClient {
  const apiKey = process.env.WHOP_DM_API_KEY;
  if (!apiKey) throw new Error("WHOP_DM_API_KEY is not set");
  return new WhopClient({ token: apiKey });
}
