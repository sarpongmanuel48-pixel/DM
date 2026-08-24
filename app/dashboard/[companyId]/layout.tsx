import { headers } from "next/headers";
import { getCurrentCreator, getOrCreateCreator, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FirstRunSetup } from "@/components/dashboard/FirstRunSetup";

/** Every dashboard route lives under /dashboard/[companyId] — Whop's own
 * recommended structure for a Dashboard-view app (confirmed against
 * docs.whop.com/developer/guides/app-views). This layout verifies the
 * request, resolves (or creates) the Creator row for that company, and
 * either shows the first-run setup flow or the normal dashboard chrome. */
export default async function CompanyDashboardLayout({
  children,
  params,
}: LayoutProps<"/dashboard/[companyId]">) {
  const { companyId } = await params;
  const headerList = await headers();

  let whopUserId: string;
  let creator;
  try {
    const result = await getCurrentCreator(companyId, headerList);
    whopUserId = result.whopUserId;
    creator = result.creator ?? (await getOrCreateCreator(companyId, result.whopUserId));
  } catch (error) {
    if (error instanceof DashboardAuthError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
          <div className="max-w-sm text-center">
            <h1 className="font-display text-xl font-bold text-ink-900">Can&apos;t verify your Whop session</h1>
            <p className="mt-2 text-sm text-ink-500">
              Open DM from inside your Whop dashboard — this page only works loaded in that context.
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }
  void whopUserId;

  if (!creator.publishedAt) {
    return <FirstRunSetup companyId={companyId} />;
  }

  const initials = creator.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)" }}>
      <DashboardHeader companyId={companyId} initials={initials || "?"} />
      <main className="mx-auto max-w-5xl px-6 py-7">{children}</main>
    </div>
  );
}
