import { signIn } from "@/lib/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-white p-8">
        <h1 className="font-display text-xl font-bold text-ink-900">Sign in</h1>
        <div className="mt-5 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard/home" });
            }}
          >
            <button className="qbx-btn qbx-btn--lg qbx-btn--secondary" style={{ width: "100%" }}>
              Continue with Google
            </button>
          </form>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
            <span className="text-[11.5px] text-ink-400">or</span>
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
          </div>
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", { email: formData.get("email"), redirectTo: "/dashboard/home" });
            }}
            className="flex flex-col gap-2.5"
          >
            <div className="qbx-field">
              <span className="qbx-label">Email</span>
              <input name="email" type="email" required placeholder="you@example.com" className="qbx-input" />
            </div>
            <button type="submit" className="qbx-btn qbx-btn--lg qbx-btn--primary" style={{ width: "100%" }}>
              Send me a link
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
