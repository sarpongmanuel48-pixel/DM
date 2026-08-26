import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

const ctaClassName =
  "cursor-pointer rounded-xl border-none px-4 py-2 text-sm leading-none font-semibold text-white transition-colors hover:[background:var(--l-indigo-dark)]";
const ctaStyle = { background: "var(--l-gradient-primary)" };

export function Nav() {
  return (
    <nav className="mx-auto flex max-w-[1160px] items-center justify-between px-8 py-6">
      <span
        className="text-[22px] font-bold tracking-[-0.6px]"
        style={{ fontFamily: "var(--l-font-display)", color: "var(--l-ink)" }}
      >
        DM
      </span>
      <div className="flex items-center gap-7 text-sm font-medium">
        <a href="#top" className="font-semibold" style={{ color: "var(--l-mute)" }}>
          Home
        </a>
        <a href="#features" style={{ color: "var(--l-mute)" }}>
          Features
        </a>
        <a href="#pricing" style={{ color: "var(--l-mute)" }}>
          Pricing
        </a>
        {SELF_SERVE_SIGNUP_SUPPORTED ? (
          <button type="button" className={ctaClassName} style={ctaStyle}>
            Get started free
          </button>
        ) : (
          // No self-serve signup in this phase — see lib/self-serve-signup.ts.
          <a href={WHOP_APP_STORE_URL} className={`inline-block text-center ${ctaClassName}`} style={ctaStyle}>
            Install on Whop
          </a>
        )}
      </div>
    </nav>
  );
}
