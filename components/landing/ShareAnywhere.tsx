"use client";

import { useEffect, useState } from "react";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

const BADGES = ["IG", "TT", "YT", "X"] as const;
const GEO = [
  { transform: "translate(0, 0) rotate(0deg) scale(1)", zIndex: 4, barBg: "var(--l-indigo)" },
  { transform: "translate(-34px, 14px) rotate(-7deg) scale(0.95)", zIndex: 3, barBg: "var(--l-hairline-soft)" },
  { transform: "translate(34px, 26px) rotate(7deg) scale(0.9)", zIndex: 2, barBg: "var(--l-hairline-soft)" },
  { transform: "translate(-8px, 40px) rotate(-2deg) scale(0.86)", zIndex: 1, barBg: "var(--l-hairline-soft)" },
] as const;

const SHUFFLE_MS = 2400;

export function ShareAnywhere() {
  const [order, setOrder] = useState([0, 1, 2, 3]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
    }, SHUFFLE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto grid max-w-[1160px] items-center gap-20 px-8 py-24" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <h2
          className="m-0 font-bold"
          style={{ fontFamily: "var(--l-font-display)", fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.6px", color: "var(--l-ink)" }}
        >
          Share your handle{" "}
          <span style={{ textDecoration: "underline", textDecorationColor: "var(--l-ink)", textDecorationThickness: 4, textUnderlineOffset: 6 }}>
            anywhere
          </span>
          .
        </h2>
        <p className="mt-4 max-w-[400px] text-[15px] leading-normal" style={{ color: "var(--l-mute)" }}>
          One dm.to link works in every bio, every caption, every platform.
        </p>
        {SELF_SERVE_SIGNUP_SUPPORTED ? (
          <button
            type="button"
            className="mt-7 cursor-pointer rounded-xl border-none px-5 py-3 text-sm leading-none font-semibold text-white hover:[background:var(--l-indigo-dark)]"
            style={{ background: "var(--l-gradient-primary)" }}
          >
            Get started free
          </button>
        ) : (
          // No self-serve signup in this phase — see lib/self-serve-signup.ts.
          <a
            href={WHOP_APP_STORE_URL}
            className="mt-7 inline-block cursor-pointer rounded-xl border-none px-5 py-3 text-sm leading-none font-semibold text-white hover:[background:var(--l-indigo-dark)]"
            style={{ background: "var(--l-gradient-primary)" }}
          >
            Install on Whop
          </a>
        )}
      </div>

      <div className="flex flex-col items-center gap-7">
        <div className="relative" style={{ width: 300, height: 240 }}>
          {BADGES.map((badge, badgeIdx) => {
            const pos = order.indexOf(badgeIdx);
            const geo = GEO[pos];
            return (
              <div
                key={badge}
                className="absolute top-0 left-10 box-border flex w-[220px] flex-col gap-3 rounded-[20px] p-5 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ background: "var(--l-canvas)", boxShadow: "var(--l-shadow-float)", transform: geo.transform, zIndex: geo.zIndex }}
              >
                <div className="flex items-center justify-between">
                  <div className="size-[34px] rounded-full" style={{ background: "var(--l-surface-card)" }} />
                  <div
                    className="flex size-[30px] items-center justify-center rounded-full text-[11px] font-medium"
                    style={{ background: "var(--l-canvas)", border: "1px solid var(--l-hairline)", color: "var(--l-ink)", fontFamily: "var(--l-font-mono)" }}
                  >
                    {badge}
                  </div>
                </div>
                <div className="h-[7px] w-[62%] rounded" style={{ background: "var(--l-stone)" }} />
                <div className="h-[7px] w-[40%] rounded" style={{ background: "var(--l-hairline-soft)" }} />
                <div className="mt-1 flex flex-col gap-2">
                  <div className="h-[26px] rounded-lg" style={{ border: "1.5px solid var(--l-hairline)" }} />
                  <div className="h-[26px] rounded-lg" style={{ background: geo.barBg }} />
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="rounded-full px-4 py-2 text-[13px]"
          style={{ border: "1px solid var(--l-hairline)", color: "var(--l-ink)", fontFamily: "var(--l-font-mono)" }}
        >
          dm.to/yourname
        </div>
      </div>
    </section>
  );
}
