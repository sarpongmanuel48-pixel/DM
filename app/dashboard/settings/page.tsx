import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDmProCheckoutUrl } from "@/lib/whop/checkout";
import { DisconnectButton } from "@/components/dashboard/DisconnectButton";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-white p-5">
      <h2 className="mb-3.5 text-[13.5px] font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

// 3E — page address, Whop connection, custom domain (coming soon),
// account, and billing.
export default async function SettingsPage() {
  const session = await auth();
  const creator = await prisma.creator.findUniqueOrThrow({ where: { userId: session!.user!.id! } });
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-ink-900">
              {creator.whopConnectionStatus === "CONNECTED"
                ? "Connected"
                : creator.whopConnectionStatus === "EXPIRED"
                  ? "Expired — reconnect to resume syncing"
                  : "Not connected"}
            </div>
            <p className="mt-1 max-w-[380px] text-xs text-ink-500">
              Disconnecting keeps your page online but freezes prices at the last sync — it doesn&apos;t
              break the page.
            </p>
          </div>
          {creator.whopConnectionStatus === "CONNECTED" ? (
            <DisconnectButton />
          ) : (
            <Link href="/api/whop/connect" className="qbx-btn qbx-btn--utility flex-none">
              Reconnect
            </Link>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Custom domain">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-700">Point your own domain at your DM page.</p>
          <span className="qbx-badge qbx-badge--neutral">Coming soon</span>
        </div>
      </SettingsSection>

      <SettingsSection title="Account">
        <div className="text-sm text-ink-700">Signed in as {session!.user!.email ?? session!.user!.name}</div>
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
