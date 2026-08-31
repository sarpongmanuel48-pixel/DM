"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * One shared form for /sign-up and /sign-in — Auth.js doesn't actually
 * distinguish new vs. returning for either provider (Google links/creates
 * an account either way; the email link works whether or not the address
 * has signed in before), so the two routes render the same form with
 * different copy. Uses next-auth/react's client-side signIn (not
 * lib/auth.ts's server-side export) — it works without a SessionProvider
 * since it just POSTs to the API route, and nothing here reads reactive
 * session state.
 */
export function AuthForm({ heading, initialHandle }: { heading: string; initialHandle?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-2 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Check your email</h1>
        <p className="text-sm text-ink-500">We sent a sign-in link to {email}.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <h1 className="text-center font-display text-2xl font-bold text-ink-900">{heading}</h1>

      <Button type="button" variant="utility" className="w-full" onClick={() => signIn("google", { callbackUrl: "/app" })}>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
        or
        <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
      </div>

      <form onSubmit={submitEmail} className="flex flex-col gap-2.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Continue with email"}
        </Button>
      </form>

      {initialHandle && (
        <p className="text-center text-xs text-ink-400">dm.to/{initialHandle} is waiting for you once you&apos;re in.</p>
      )}
    </div>
  );
}
