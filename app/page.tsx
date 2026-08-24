// No marketing/landing screen exists in the design pass. There's also no
// DM-hosted sign-up anymore — DM is installed as a Whop dashboard app
// (whop.com's App Store), which is where a creator actually finds and
// adds it; this root route has nothing to hand off to.
export default function RootPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink-900">DM</h1>
        <p className="mt-2 text-sm text-ink-500">
          A link-in-bio storefront for Whop creators. Install it from your Whop dashboard&apos;s apps
          list to get started.
        </p>
      </div>
    </main>
  );
}
