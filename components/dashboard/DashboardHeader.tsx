"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardHeader({ companyId, initials }: { companyId: string; initials: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${companyId}`;
  const NAV = [
    { href: `${base}/home`, label: "Home" },
    { href: `${base}/editor`, label: "Editor" },
    { href: `${base}/offers`, label: "Offers" },
    { href: `${base}/analytics`, label: "Analytics" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <header className="flex items-center justify-between border-b border-hairline bg-white px-5.5 py-3.5">
      <div className="flex items-center gap-6">
        <span className="font-display text-[15px] font-bold tracking-widest text-ink-900">DM</span>
        <nav className="flex gap-4.5 text-[13px] font-medium text-ink-500">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ color: pathname.startsWith(item.href) ? "var(--ink-900)" : undefined }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <span
        className="flex items-center justify-center rounded-full font-display text-[11px] font-bold"
        style={{ width: 28, height: 28, background: "var(--accent-soft)", color: "var(--accent-ink)" }}
      >
        {initials}
      </span>
    </header>
  );
}
