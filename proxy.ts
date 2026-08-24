import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (the `middleware` export
 * is deprecated in favor of a `proxy` export). Guards the two authenticated
 * surfaces — onboarding and the dashboard — while leaving the public
 * storefront (dm.to/[handle]) and (auth) routes open, per the plan's
 * "don't share auth logic between surfaces" split.
 */
export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (!session?.user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/dashboard/:path*"],
};
