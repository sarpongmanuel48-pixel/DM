import Link from "next/link";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";
import { PrimaryCta } from "./PrimaryCta";

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  dark,
}: {
  name: string;
  price: string;
  period?: string;
  features: { label: string; badge?: string }[];
  cta: { label: string; primary?: boolean };
  dark?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-6 rounded-[20px] p-8"
      style={
        dark
          ? { background: "var(--l-gradient-dark)" }
          : { background: "var(--l-canvas)", boxShadow: "var(--l-shadow-card)" }
      }
    >
      <div>
        <div className="text-base font-semibold" style={{ fontFamily: "var(--l-font-display)", color: dark ? "#fff" : "var(--l-ink)" }}>
          {name}
        </div>
        <div
          className="mt-2.5 font-bold"
          style={{ fontFamily: "var(--l-font-display)", fontSize: 36, letterSpacing: "-0.6px", color: dark ? "#fff" : "var(--l-ink)" }}
        >
          {price}
          {period && (
            <span className="text-sm font-normal" style={{ color: dark ? "rgba(255,255,255,0.6)" : "var(--l-mute)" }}>
              {period}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 text-[15px] leading-normal" style={{ color: dark ? "rgba(255,255,255,0.85)" : "var(--l-body)" }}>
        {features.map((f) => (
          <span key={f.label} className="flex items-start gap-2">
            {f.label}
            {f.badge && (
              <span
                className="flex-none rounded-full px-2 py-[3px] text-xs font-medium whitespace-nowrap"
                style={{ border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.6)" }}
              >
                {f.badge}
              </span>
            )}
          </span>
        ))}
      </div>
      {cta.primary ? (
        <PrimaryCta className="mt-auto">{cta.label}</PrimaryCta>
      ) : SELF_SERVE_SIGNUP_SUPPORTED ? (
        // Secondary styling on purpose, not PrimaryCta — Pro's the only
        // tier that should carry the dark/"recommended" treatment; giving
        // Free/Plus the same look would flatten that hierarchy.
        <Link
          href="/sign-up"
          className="mt-auto block rounded-xl py-3 text-center text-sm font-semibold"
          style={{ background: "var(--l-canvas)", color: "var(--l-ink)", border: "1px solid var(--l-hairline)", textDecoration: "none" }}
        >
          {cta.label}
        </Link>
      ) : (
        // No self-serve signup in this phase — every plan starts with
        // installing on Whop; Plus/Pro upgrades happen from the dashboard's
        // Settings page. See lib/self-serve-signup.ts.
        <a
          href={WHOP_APP_STORE_URL}
          className="mt-auto block rounded-xl py-3 text-center text-sm font-semibold"
          style={{ background: "var(--l-canvas)", color: "var(--l-ink)", border: "1px solid var(--l-hairline)", textDecoration: "none" }}
        >
          Install on Whop
        </a>
      )}
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1160px] px-8 pt-8 pb-24">
      <h2
        className="m-0 mb-12 text-center font-bold"
        style={{ fontFamily: "var(--l-font-display)", fontSize: 36, letterSpacing: "-0.6px", color: "var(--l-ink)" }}
      >
        Pricing
      </h2>
      <div className="grid items-stretch gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <PlanCard
          name="Free"
          price="$0"
          features={[{ label: "Unlimited links" }, { label: "One connected platform" }, { label: "Basic analytics" }]}
          cta={{ label: "Get started free" }}
        />
        <PlanCard
          name="Plus"
          price="$6"
          period="/month"
          features={[{ label: "Everything in Free" }, { label: "Branding removed" }, { label: "Faster sync" }]}
          cta={{ label: "Choose Plus" }}
        />
        <PlanCard
          name="Pro"
          price="$15"
          period="/month"
          dark
          features={[
            { label: "Full analytics" },
            { label: "Fastest sync" },
            { label: "Multi-platform connections", badge: "coming soon" },
            { label: "Custom domain", badge: "coming soon" },
          ]}
          cta={{ label: "Choose Pro", primary: true }}
        />
      </div>
    </section>
  );
}
