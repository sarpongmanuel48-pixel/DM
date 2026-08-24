import { randomBytes, createHash } from "node:crypto";

/**
 * The read-only "Connect Whop" OAuth flow — a creator authorizing DM to read
 * their product catalog and account profile. This is entirely separate from
 * Auth.js (which handles signing into DM itself). Endpoints and parameters
 * confirmed against https://docs.whop.com/developer/guides/oauth.
 *
 * Requested scope covers only what the connect screen (2A) promises: reading
 * identity (openid/profile/email) plus product/plan listing. The exact
 * scope identifier for product read access isn't documented publicly — verify
 * it in the Whop dev dashboard when registering the OAuth app and adjust
 * WHOP_OAUTH_SCOPE if needed.
 */

const WHOP_OAUTH_BASE = "https://api.whop.com/oauth";
const DEFAULT_SCOPE = "openid profile email read:products";

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface PkcePair {
  verifier: string;
  challenge: string;
}

export function generatePkcePair(): PkcePair {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function generateState(): string {
  return base64url(randomBytes(16));
}

export function buildAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
  companyId?: string;
}): string {
  const url = new URL(`${WHOP_OAUTH_BASE}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireEnv("WHOP_OAUTH_CLIENT_ID"));
  url.searchParams.set("redirect_uri", requireEnv("WHOP_OAUTH_REDIRECT_URI"));
  url.searchParams.set("scope", process.env.WHOP_OAUTH_SCOPE ?? DEFAULT_SCOPE);
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", generateState());
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (params.companyId) url.searchParams.set("company_id", params.companyId);
  return url.toString();
}

export interface WhopTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(params: {
  code: string;
  codeVerifier: string;
}): Promise<WhopTokenResponse> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: requireEnv("WHOP_OAUTH_REDIRECT_URI"),
      client_id: requireEnv("WHOP_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("WHOP_OAUTH_CLIENT_SECRET"),
      code_verifier: params.codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Whop token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<WhopTokenResponse> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: requireEnv("WHOP_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("WHOP_OAUTH_CLIENT_SECRET"),
    }),
  });
  if (!res.ok) {
    throw new Error(`Whop token refresh failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function revokeToken(refreshToken: string): Promise<void> {
  await fetch(`${WHOP_OAUTH_BASE}/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: requireEnv("WHOP_OAUTH_CLIENT_ID"),
    }),
  });
}

export interface WhopUserInfo {
  sub: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export async function fetchUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Whop userinfo fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}
