import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";
import { exchangeCodeForTokens, fetchUserInfo } from "@/lib/whop/oauth";
import { whopClientForCreator } from "@/lib/whop/client";
import { fetchOwnCompanyId } from "@/lib/whop/products";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("whop_oauth_state")?.value;
  const verifier = request.cookies.get("whop_oauth_verifier")?.value;

  if (!code || !state || !verifier || state !== cookieState) {
    return NextResponse.redirect(new URL("/onboarding/connect?error=state_mismatch", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens({ code, codeVerifier: verifier });
    const userInfo = await fetchUserInfo(tokens.access_token);
    const companyId = await fetchOwnCompanyId(whopClientForCreator(tokens.access_token));

    await prisma.creator.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        handle: crypto.randomUUID().slice(0, 8), // placeholder — claimed for real on 2C
        name: userInfo.name ?? userInfo.preferred_username ?? "New creator",
        avatarUrl: userInfo.picture ?? null,
        whopConnectionStatus: "CONNECTED",
        whopCompanyId: companyId,
        whopUserId: userInfo.sub,
        whopAccessToken: encryptToken(tokens.access_token),
        whopRefreshToken: encryptToken(tokens.refresh_token),
        whopTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
      update: {
        whopConnectionStatus: "CONNECTED",
        whopCompanyId: companyId,
        whopUserId: userInfo.sub,
        whopAccessToken: encryptToken(tokens.access_token),
        whopRefreshToken: encryptToken(tokens.refresh_token),
        whopTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    const response = NextResponse.redirect(new URL("/onboarding/importing", request.url));
    response.cookies.delete("whop_oauth_state");
    response.cookies.delete("whop_oauth_verifier");
    return response;
  } catch (error) {
    console.error("Whop connect callback failed", error);
    return NextResponse.redirect(new URL("/onboarding/connect?error=connect_failed", request.url));
  }
}
