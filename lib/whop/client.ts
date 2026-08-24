import { WhopClient } from "@whop/sdk";

/** A client acting with a specific creator's OAuth access token — read-only,
 * scoped to whatever that creator granted during "Connect Whop" (2A). */
export function whopClientForCreator(accessToken: string): WhopClient {
  return new WhopClient({ token: accessToken });
}

/** A client acting as DM's own Whop company — used only for DM Pro billing
 * (checkout/plan lookups), never for reading a creator's own catalog. */
export function whopClientForDm(): WhopClient {
  const apiKey = process.env.WHOP_DM_API_KEY;
  if (!apiKey) throw new Error("WHOP_DM_API_KEY is not set");
  return new WhopClient({ token: apiKey });
}
