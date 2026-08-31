import Link from "next/link";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

// The one shared primary-CTA control for the whole marketing page. Every
// instance across Nav/Hero/ShareAnywhere/PreviewSandbox/Pricing branched the
// same way already — a real control when self-serve signup exists, a
// Whop-install link when it doesn't (see lib/self-serve-signup.ts) — but
// each had its own local className/style constant, which is exactly how
// they drifted to three different paddings. Style lives in one place now:
// .landing-button-primary in app/globals.css.
export function PrimaryCta({ children, className = "", handle }: { children: React.ReactNode; className?: string; handle?: string }) {
  const classes = `landing-button-primary ${className}`.trim();

  if (SELF_SERVE_SIGNUP_SUPPORTED) {
    const href = handle ? `/sign-up?handle=${encodeURIComponent(handle)}` : "/sign-up";
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  // No self-serve signup in this phase — DM is installed from Whop's App
  // Store. See lib/self-serve-signup.ts.
  return (
    <a href={WHOP_APP_STORE_URL} className={classes}>
      Install on Whop
    </a>
  );
}
