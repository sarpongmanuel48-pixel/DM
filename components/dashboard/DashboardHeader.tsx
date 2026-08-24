"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard/editor", label: "Editor" },
  { href: "/dashboard/offers", label: "Offers" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

const STATUS_COLOR: Record<string, string> = {
  CONNECTED: "var(--success)",
  EXPIRED: "var(--danger)",
  DISCONNECTED: "var(--ink-400)",
};
const STATUS_LABEL: Record<string, string> = {
  CONNECTED: "Connected",
  EXPIRED: "Whop disconnected",
  DISCONNECTED: "Not connected",
};

export function DashboardHeader({
  connectionStatus,
  initials,
}: {
  connectionStatus: "CONNECTED" | "EXPIRED" | "DISCONNECTED";
  initials: string;
}) {
  const pathname = usePathname();

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
      <div className="flex items-center gap-2.5">
        <span className="qbx-statuspill" style={{ ["--_c" as string]: STATUS_COLOR[connectionStatus] }}>
          <span className="qbx-statuspill__dot" />
          {STATUS_LABEL[connectionStatus]}
        </span>
        <span
          className="flex items-center justify-center rounded-full font-display text-[11px] font-bold"
          style={{ width: 28, height: 28, background: "var(--accent-soft)", color: "var(--accent-ink)" }}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
