"use client";

import { useState } from "react";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

// Each column's 8 skeleton cards are two repeats of a 4-card pattern, so the
// -50% translateY loop lands back on an identical frame.
const COLUMNS: { speedS: number; widths: [number, number][] }[] = [
  {
    speedS: 15,
    widths: [
      [72, 46],
      [60, 40],
      [80, 52],
      [66, 44],
    ],
  },
  {
    speedS: 19,
    widths: [
      [54, 38],
      [76, 48],
      [64, 42],
      [70, 50],
    ],
  },
  {
    speedS: 16.5,
    widths: [
      [68, 44],
      [56, 36],
      [78, 50],
      [62, 46],
    ],
  },
];

export function Hero() {
  const [handle, setHandle] = useState("");
  const ctaLabel = handle.trim() ? "Claim your account" : "Get started free";

  const ctaClassName =
    "cursor-pointer rounded-xl border-none px-5 py-3.5 text-sm leading-none font-semibold text-white transition-colors hover:[background:var(--l-indigo-dark)]";
  const ctaStyle = { background: "var(--l-gradient-primary)" };

  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1160px] items-center gap-12 px-8 pb-24 pt-14"
      style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 0.8fr)" }}
    >
      <div>
        <h1
          className="m-0 font-bold"
          style={{
            fontFamily: "var(--l-font-display)",
            fontSize: "clamp(46px, 6.4vw, 84px)",
            lineHeight: 1.02,
            letterSpacing: "-2px",
            color: "var(--l-ink)",
          }}
        >
          One link.
          <br />
          Everything you{" "}
          <span
            style={{
              textDecoration: "underline",
              textDecorationColor: "var(--l-ink)",
              textDecorationThickness: 6,
              textUnderlineOffset: 8,
            }}
          >
            sell
          </span>
          .
        </h1>
        <p className="mt-7 max-w-[460px] text-[15px] leading-normal" style={{ color: "var(--l-mute)" }}>
          Start free with plain links, connect a platform whenever, products stay current automatically.
        </p>

        <div className="mt-8 flex max-w-[420px] flex-col gap-3">
          {SELF_SERVE_SIGNUP_SUPPORTED ? (
            <>
              <label
                className="flex items-center gap-0.5 rounded-xl px-4 py-3"
                style={{ border: "1px solid var(--l-hairline)", background: "var(--l-canvas)" }}
              >
                <span className="text-[13px]" style={{ fontFamily: "var(--l-font-mono)", color: "var(--l-mute)" }}>
                  dm.to/
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourname"
                  className="flex-1 border-none bg-transparent p-0 text-[13px] outline-none"
                  style={{ fontFamily: "var(--l-font-mono)", color: "var(--l-ink)" }}
                />
              </label>
              <button type="button" className={ctaClassName} style={ctaStyle}>
                {ctaLabel}
              </button>
            </>
          ) : (
            // No self-serve signup in this phase — DM is installed from
            // Whop's App Store. See lib/self-serve-signup.ts.
            <a href={WHOP_APP_STORE_URL} className={`inline-block text-center ${ctaClassName}`} style={ctaStyle}>
              Install on Whop
            </a>
          )}
        </div>

        <div className="mt-7 flex items-center gap-6 text-[13px]" style={{ color: "var(--l-ink)" }}>
          <span className="flex items-center gap-2">
            <span className="size-[7px] rounded-full" style={{ background: "var(--l-ink)" }} />
            Read-only, always
          </span>
          <span className="flex items-center gap-2">
            <span className="size-[7px] rounded-full" style={{ background: "var(--l-ink)" }} />
            Live in minutes
          </span>
        </div>
      </div>

      <div
        className="relative h-[520px] overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)",
        }}
      >
        <div className="grid h-full grid-cols-3 gap-3">
          {COLUMNS.map((col, i) => (
            <div
              key={i}
              className="landing-marquee-vertical flex flex-col gap-3"
              style={{ animationDuration: `${col.speedS}s` }}
            >
              {[...col.widths, ...col.widths].map(([w1, w2], j) => (
                <SkeletonCard key={j} w1={w1} w2={w2} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonCard({ w1, w2 }: { w1: number; w2: number }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{ background: "var(--l-canvas)", boxShadow: "var(--l-shadow-card)" }}
    >
      <div className="size-[26px] rounded-full" style={{ background: "var(--l-surface-card)" }} />
      <div className="h-[6px] rounded-[3px]" style={{ width: `${w1}%`, background: "var(--l-stone)" }} />
      <div className="h-[6px] rounded-[3px]" style={{ width: `${w2}%`, background: "var(--l-hairline-soft)" }} />
      <div className="h-5 rounded-md" style={{ background: "var(--l-indigo)" }} />
    </div>
  );
}
