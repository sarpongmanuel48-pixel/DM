import { auth, signOut } from "@/lib/auth";
import { requireCreatorForPage } from "@/lib/standalone-auth";
import { getDmProCheckoutUrl } from "@/lib/whop/checkout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-white p-5">
      <h2 className="mb-3.5 text-[13.5px] font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Standalone analogue of app/dashboard/[companyId]/settings/page.tsx.
 * "Whop connection" doesn't apply here — replaced with "Account" (the
 * signed-in email + sign out, the standalone equivalent of "uninstall to
 * revoke access"). Page address/Custom domain/Billing are unchanged:
 * DM Pro billing (getDmProCheckoutUrl) is DM's own Whop company for its
 * own $15/mo plan, unrelated to which platform the creator is on.
 */
export default async function StandaloneSettingsPage() {
  const creator = await requireCreatorForPage();
  const session = await auth();
  const dmProUrl = await getDmProCheckoutUrl().catch(() => null);

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 640 }}>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Settings</h1>

      <SettingsSection title="Page address">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-sm text-ink-900">dm.to/{creator.handle}</div>
            <p className="mt-1 text-xs text-ink-500">
              Changing this breaks links you&apos;ve already shared — the old address won&apos;t redirect.
            </p>
          </div>
          <Button type="button" variant="utility" className="flex-none">
            Change
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Account">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-ink-700">{session?.user?.email}</div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="utility" className="flex-none">
              Sign out
            </Button>
          </form>
        </div>
      </SettingsSection>

      <SettingsSection title="Custom domain">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-700">Point your own domain at your DM page.</p>
          <Badge variant="muted">Coming soon</Badge>
        </div>
      </SettingsSection>

      <SettingsSection title="Billing">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-ink-900">DM Pro</span>
              <span className="font-mono text-sm text-ink-700">$15/month</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Status: {creator.dmSubscriptionStatus === "ACTIVE" ? "Active" : "Inactive"}
            </p>
          </div>
          {dmProUrl && (
            <a href={dmProUrl} className={buttonVariants({ variant: "utility", className: "flex-none" })}>
              Manage billing
            </a>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
