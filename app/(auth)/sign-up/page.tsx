import { signIn } from "@/lib/auth";

const STEPS = [
  { title: "Connect Whop", body: "Read-only. Nothing in your account changes." },
  { title: "Your offers import", body: "Names, prices and types, straight from Whop." },
  { title: "Share your handle", body: "One link in your bio, for every product." },
];

// 4A — Step 1 of onboarding.
export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="flex w-full max-w-3xl overflow-hidden rounded-lg border border-hairline bg-white shadow-md">
        <div className="flex flex-1 flex-col gap-5 p-11">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[28px] font-bold tracking-tight text-ink-900">
              One page for everything you sell
            </h1>
            <p className="max-w-sm text-[15px] text-ink-700">
              Connect Whop and your products lay themselves out. Under 2 minutes, and you never
              re-type a price.
            </p>
          </div>

          <div className="flex max-w-sm flex-col gap-2.5">
            <form action={async () => { "use server"; await signIn("google", { redirectTo: "/onboarding/connect" }); }}>
              <button className="qbx-btn qbx-btn--lg qbx-btn--secondary" style={{ width: "100%", justifyContent: "flex-start", gap: 10 }}>
                <span className="inline-block rounded-full" style={{ width: 18, height: 18, background: "var(--canvas-soft)" }} />
                Continue with Google
              </button>
            </form>
            <div className="flex items-center gap-3 py-1.5">
              <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
              <span className="text-[11.5px] text-ink-400">or</span>
              <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
            </div>
            <form
              action={async (formData: FormData) => {
                "use server";
                await signIn("resend", { email: formData.get("email"), redirectTo: "/onboarding/connect" });
              }}
              className="flex flex-col gap-2.5"
            >
              <div className="qbx-field">
                <span className="qbx-label">Email</span>
                <input name="email" type="email" required placeholder="you@example.com" className="qbx-input" />
              </div>
              <button type="submit" className="qbx-btn qbx-btn--lg qbx-btn--primary" style={{ width: "100%" }}>
                Create my account
              </button>
            </form>
            <div className="text-[11.5px] text-ink-400">
              By continuing you agree to the <span className="text-blue-600">terms</span> and{" "}
              <span className="text-blue-600">privacy policy</span>.
            </div>
          </div>
        </div>

        <div className="flex w-[330px] flex-none flex-col gap-5 border-l border-hairline p-9">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">How it works</div>
          <div className="flex flex-col gap-4.5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3">
                <span
                  className="flex flex-none items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ width: 24, height: 24, background: "var(--blue-50)", color: "var(--blue-700)" }}
                >
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <div className="text-[13.5px] font-semibold text-ink-900">{step.title}</div>
                  <div className="text-[12.5px] text-ink-500">{step.body}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-hairline pt-5 text-xs text-ink-500">
            DM never handles payments. Buyers always check out on Whop.
          </div>
        </div>
      </div>
    </main>
  );
}
