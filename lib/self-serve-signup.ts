/**
 * Single source of truth for whether DM has any self-serve signup path
 * right now — true since the standalone surface (lib/auth.ts, /sign-up,
 * /app) shipped. Deliberately its own file with zero other imports: it
 * needs to be importable from client components (the marketing landing
 * page) without pulling in lib/host-context.ts's server-only dependencies
 * (Prisma, the Whop token-verification code) into the browser bundle.
 * See lib/host-context.ts for the full HostContext this also backs.
 */
export const SELF_SERVE_SIGNUP_SUPPORTED = true;

/** Where the landing page's CTAs point instead, while self-serve signup
 * isn't available — set NEXT_PUBLIC_WHOP_APP_STORE_URL to DM's real Whop
 * App Store listing. */
export const WHOP_APP_STORE_URL = process.env.NEXT_PUBLIC_WHOP_APP_STORE_URL || "https://whop.com/apps";
