"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

gsap.registerPlugin(useGSAP);

const HERO_COLLAGE_IMAGES: string[] = [
  "/personas/maya-rivera.jpg",
  "/personas/riley-park.jpg",
  "/personas/priya-nair.jpg",
  "/personas/jordan-reyes.jpg",
  "/personas/chronos-pro.jpg",
  "/personas/vocal-pro.jpg",
];

// Full-bleed tiled photo wall: one uniform grid, rotated once as a rigid
// unit (not per-tile) — per the confirmed reference. Oversized well past
// the section's own box before rotating so the corners never peek through
// at any viewport width/height.
const GRID_COLUMNS = 6;
const GRID_ROWS = 6;
const GRID_ROTATION_DEG = -13;

// (row + col) % images.length instead of a flat index — keeps the same
// image from repeating twice in any single row.
const BACKGROUND_TILES = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLUMNS }, (_, col) => HERO_COLLAGE_IMAGES[(row + col) % HERO_COLLAGE_IMAGES.length])
).flat();

export function Hero() {
  const [handle, setHandle] = useState("");
  const ctaLabel = handle.trim() ? "Claim your account" : "Get started free";

  const backgroundRef = useRef<HTMLDivElement>(null);

  // gsap.from() applies the opacity:0 starting state synchronously in the
  // layout-effect useGSAP runs, before the browser paints — so this replays
  // the fade-in on every mount without a rAF-triggered-boolean dance.
  useGSAP(
    () => {
      gsap.from(backgroundRef.current, { opacity: 0, duration: 0.9, ease: "power1.out" });
    },
    { scope: backgroundRef }
  );

  const ctaClassName =
    "cursor-pointer rounded-xl border-none px-5 py-3.5 text-sm leading-none font-semibold text-white transition-colors hover:[background:var(--l-indigo-dark)]";
  const ctaStyle = { background: "var(--l-gradient-primary)" };

  return (
    <section id="top" className="relative isolate flex min-h-[640px] items-center overflow-hidden">
      <div ref={backgroundRef} className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 grid"
          style={{
            width: "160%",
            height: "320%",
            gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            gap: 3,
            background: "var(--l-canvas)",
            transform: `translate(-50%, -50%) rotate(${GRID_ROTATION_DEG}deg)`,
          }}
        >
          {BACKGROUND_TILES.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="size-full object-cover" style={{ aspectRatio: "4 / 5" }} />
          ))}
        </div>
        {/* Scrim: opaque where the headline sits, fading out toward the
            right so the photo wall still reads through at the edge. */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(100deg, var(--l-canvas) 0%, var(--l-canvas) 42%, rgba(255,255,255,0.55) 68%, rgba(255,255,255,0.1) 100%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1160px] px-8 py-24">
        <div className="max-w-[600px]">
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
      </div>
    </section>
  );
}
