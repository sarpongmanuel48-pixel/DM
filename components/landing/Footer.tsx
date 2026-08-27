const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#top" },
      { label: "Contact", href: "#top" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#top" },
      { label: "Terms", href: "#top" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--l-hairline-soft)", background: "var(--l-canvas)" }}>
      <div className="mx-auto grid max-w-[1160px] gap-10 px-8 pt-16 pb-10" style={{ gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))" }}>
        <div>
          <span className="text-xl font-bold" style={{ fontFamily: "var(--l-font-display)", letterSpacing: "-0.6px", color: "var(--l-ink)" }}>
            DM
          </span>
          <p className="mt-3 max-w-[220px] text-[13px] leading-[1.45]" style={{ color: "var(--l-mute)" }}>
            One link for everything you sell.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading} className="flex flex-col gap-2.5">
            <div className="text-xs font-medium" style={{ color: "var(--l-ash)" }}>
              {col.heading}
            </div>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px]"
                style={{ color: "var(--l-mute)", textDecoration: "none" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1160px] px-8 pb-10 text-xs" style={{ color: "var(--l-ash)" }}>
        © 2026 DM
      </div>
    </footer>
  );
}
