import { PrimaryCta } from "./PrimaryCta";

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
        {/* Utility navigation, not inline text links — explicitly no
            underline, unlike the .landing default a{} now carries. */}
        <a href="#top" className="font-semibold" style={{ color: "var(--l-mute)", textDecoration: "none" }}>
          Home
        </a>
        <a href="#features" style={{ color: "var(--l-mute)", textDecoration: "none" }}>
          Features
        </a>
        <a href="#pricing" style={{ color: "var(--l-mute)", textDecoration: "none" }}>
          Pricing
        </a>
        <PrimaryCta>Get started free</PrimaryCta>
      </div>
    </nav>
  );
}
