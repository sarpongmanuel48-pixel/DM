import { notFound } from "next/navigation";
import { getCreatorByCompanyId } from "@/lib/whop/dashboard-auth";
import { getDmProCheckoutUrl } from "@/lib/whop/checkout";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-white p-5">
      <h2 className="mb-3.5 text-[13.5px] font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

// 3E — page address, Whop connection, custom domain (coming soon), billing.
export default async function SettingsPage({ params }: PageProps<"/dashboard/[companyId]/settings">) {
  const { companyId } = await params;
  const creator = await getCreatorByCompanyId(companyId);
  if (!creator) notFound();
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
          <button type="button" className="qbx-btn qbx-btn--utility flex-none">
            Change
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Whop connection">
        <div className="text-sm text-ink-700">
          DM reads this account&apos;s catalog through the permissions granted when you installed it —
          there&apos;s nothing to connect or disconnect here. Uninstall DM from your Whop apps list to
          revoke access; your page stays live on whatever was last synced.
        </div>
      </SettingsSection>

      <SettingsSection title="Custom domain">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-700">Point your own domain at your DM page.</p>
          <span className="qbx-badge qbx-badge--neutral">Coming soon</span>
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
            <a href={dmProUrl} className="qbx-btn qbx-btn--utility flex-none">
              Manage billing
            </a>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
