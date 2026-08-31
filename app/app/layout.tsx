import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrCreateStandaloneCreator } from "@/lib/standalone-auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

/**
 * Standalone analogue of app/dashboard/[companyId]/layout.tsx — same job
 * (verify identity once, resolve or create the Creator row, render the
 * dashboard chrome), session-based instead of Whop-iframe-based. No
 * FirstRunSetup gate here: getOrCreateStandaloneCreator sets publishedAt
 * immediately (there's no Whop catalog to import before publishing), so a
 * standalone creator lands straight in a real, if empty, dashboard.
 */
export default async function StandaloneAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in");
  }
  const creator = await getOrCreateStandaloneCreator(session.user.email);

  const initials = creator.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)" }}>
      <DashboardHeader basePath="/app" initials={initials || "?"} />
      <main className="mx-auto max-w-5xl px-6 py-7">{children}</main>
    </div>
  );
}
