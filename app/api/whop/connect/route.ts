import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildAuthorizeUrl, generatePkcePair, generateState } from "@/lib/whop/oauth";

/** Starts the read-only "Connect Whop" flow (2A's "Continue to Whop" button).
 * Distinct from Auth.js sign-in — this authorizes DM to read an already
 * signed-in creator's Whop catalog. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { verifier, challenge } = generatePkcePair();
  const state = generateState();
  const authorizeUrl = buildAuthorizeUrl({ state, codeChallenge: challenge });

  const response = NextResponse.redirect(authorizeUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  response.cookies.set("whop_oauth_state", state, cookieOptions);
  response.cookies.set("whop_oauth_verifier", verifier, cookieOptions);
  return response;
}
