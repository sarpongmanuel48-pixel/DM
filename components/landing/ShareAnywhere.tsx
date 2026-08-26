"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

gsap.registerPlugin(useGSAP, CustomEase);

const BADGES = ["IG", "TT", "YT", "X"] as const;

// Same four stack positions as before, just as discrete numeric fields
// instead of a `transform` string — GSAP tweens x/y/rotation/scale
// independently, not a shorthand transform string.
const GEO = [
  { x: 0, y: 0, rotation: 0, scale: 1, zIndex: 4, barBg: "var(--l-indigo)" },
  { x: -34, y: 14, rotation: -7, scale: 0.95, zIndex: 3, barBg: "var(--l-hairline-soft)" },
  { x: 34, y: 26, rotation: 7, scale: 0.9, zIndex: 2, barBg: "var(--l-hairline-soft)" },
  { x: -8, y: 40, rotation: -2, scale: 0.86, zIndex: 1, barBg: "var(--l-hairline-soft)" },
] as const;

const SHUFFLE_MS = 2400;
const SHUFFLE_S = SHUFFLE_MS / 1000;

// Exact same curve as the previous CSS `transition-timing-function`, carried
// over via CustomEase so the mechanism swap doesn't change how it feels.
const SHUFFLE_EASE = CustomEase.create("shareStackShuffle", "0.4, 0, 0.2, 1");

// Badge b sits at GEO[(b - step) mod 4] after `step` shuffles — the front
// card jumps straight to the back, everything else advances by one slot.
// (Mirrors the old `setOrder(([first, ...rest]) => [...rest, first])`.)
function geoAt(badgeIdx: number, step: number) {
  return GEO[(((badgeIdx - step) % GEO.length) + GEO.length) % GEO.length];
}

export function ShareAnywhere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.set(cardRefs.current, {
        x: (i) => geoAt(i, 0).x,
        y: (i) => geoAt(i, 0).y,
        rotation: (i) => geoAt(i, 0).rotation,
        scale: (i) => geoAt(i, 0).scale,
        zIndex: (i) => geoAt(i, 0).zIndex,
      });
      gsap.set(barRefs.current, { background: (i) => geoAt(i, 0).barBg });

      const tl = gsap.timeline({ repeat: -1 });
      for (let step = 1; step <= GEO.length; step++) {
        const at = SHUFFLE_S * step;
        // zIndex and bar color swap instantly, same as the old
        // `transition-[transform,opacity]` (background-color was never
        // in that list, so it never animated either).
        tl.set(cardRefs.current, { zIndex: (i) => geoAt(i, step).zIndex }, at)
          .set(barRefs.current, { background: (i) => geoAt(i, step).barBg }, at)
          .to(
            cardRefs.current,
            {
              x: (i) => geoAt(i, step).x,
              y: (i) => geoAt(i, step).y,
              rotation: (i) => geoAt(i, step).rotation,
              scale: (i) => geoAt(i, step).scale,
              duration: 0.6,
              ease: SHUFFLE_EASE,
            },
            at
          );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="mx-auto grid max-w-[1160px] items-center gap-20 px-8 py-24"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
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
          {BADGES.map((badge, badgeIdx) => (
            <div
              key={badge}
              ref={(el) => {
                cardRefs.current[badgeIdx] = el;
              }}
              className="absolute top-0 left-10 box-border flex w-[220px] flex-col gap-3 rounded-[20px] p-5"
              style={{
                background: "var(--l-canvas)",
                boxShadow: "var(--l-shadow-float)",
                // Matches GEO[badgeIdx] (step 0) so SSR/first paint already
                // shows the resting stack — gsap.set() below just hands the
                // same values off to GSAP's transform cache, no visual jump.
                transform: `translate(${GEO[badgeIdx].x}px, ${GEO[badgeIdx].y}px) rotate(${GEO[badgeIdx].rotation}deg) scale(${GEO[badgeIdx].scale})`,
                zIndex: GEO[badgeIdx].zIndex,
              }}
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
                <div
                  ref={(el) => {
                    barRefs.current[badgeIdx] = el;
                  }}
                  className="h-[26px] rounded-lg"
                  style={{ background: GEO[badgeIdx].barBg }}
                />
              </div>
            </div>
          ))}
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
