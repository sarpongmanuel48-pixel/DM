const LOGOS = ["Whop", "Shopify", "Gumroad", "Patreon", "Lemon Squeezy", "Ko-fi", "Substack", "Etsy"];

export function IntegrationsMarquee() {
  return (
    <section className="py-16 pb-24" style={{ borderTop: "1px solid var(--l-hairline-soft)" }}>
      <p
        className="mx-auto max-w-[640px] px-8 text-center font-bold"
        style={{ fontFamily: "var(--l-font-display)", fontSize: 24, lineHeight: 1.2, color: "var(--l-ink)" }}
      >
        Integrate your account or product from Whop, Shopify, Gumroad, Patreon, and more.
      </p>
      <div
        className="landing-marquee-track mt-12 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="landing-marquee-horizontal flex w-max gap-12">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center gap-12 pr-12">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="rounded-full px-1 py-2.5 text-xl font-semibold whitespace-nowrap"
                  style={{ fontFamily: "var(--l-font-display)", color: "var(--l-ash)" }}
                >
                  {logo}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
