"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Pencil } from "lucide-react";
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
// unit (not per-tile) — confirmed correct, unchanged from before. Sized in
// viewport units (not the section's own %) specifically so the sizing
// stays well-defined once the wall becomes a scroll container below —
// percentage heights inside a `min-height`-only ancestor don't reliably
// resolve, vw/dvh always do. 160vw/320dvh is the same oversizing as the
// original 160%/320%, just expressed against the viewport instead.
const GRID_COLUMNS = 6;
const GRID_ROWS = 6;
const GRID_ROTATION_DEG = -13;
const WALL_WIDTH_VW = 160;
const WALL_HEIGHT_VH = 320;

// (row + col) % images.length instead of a flat index — keeps the same
// image from repeating twice in any single row.
const BACKGROUND_TILES = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLUMNS }, (_, col) => HERO_COLLAGE_IMAGES[(row + col) % HERO_COLLAGE_IMAGES.length])
).flat();

export function Hero() {
  const [handle, setHandle] = useState("");
  const ctaLabel = handle.trim() ? "Claim your account" : "Get started free";

  const backgroundRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  // gsap.from() applies the opacity:0 starting state synchronously in the
  // layout-effect useGSAP runs, before the browser paints — so this replays
  // the fade-in on every mount without a rAF-triggered-boolean dance.
  useGSAP(
    () => {
      gsap.from(tileRefs.current, { opacity: 0, stagger: 0.12, duration: 0.5, ease: "power1.out" });
    },
    { scope: backgroundRef }
  );

  const ctaClassName =
    "cursor-pointer rounded-xl border-none px-5 py-3.5 text-sm leading-none font-semibold text-white transition-colors hover:[background:var(--l-indigo-dark)]";
  const ctaStyle = { background: "var(--l-gradient-primary)" };

  return (
    <section id="top" className="relative isolate flex min-h-[100dvh] items-center overflow-hidden">
      {/* The wall: a genuine scroll container, not a fixed decorative box.
          overflow-y auto (never `contain`) so the browser's native scroll
          chaining takes over once this hits its own scroll boundary and
          keeps scrolling the page — no wheel-event interception needed. */}
      <div
        ref={backgroundRef}
        className="hero-photo-wall absolute inset-0 -z-10 overflow-x-hidden overflow-y-auto"
        aria-hidden="true"
      >
        <div
          className="grid"
          style={{
            width: `${WALL_WIDTH_VW}vw`,
            height: `${WALL_HEIGHT_VH}dvh`,
            // Negative margins, not a transform, do the centering here —
            // transforms don't affect an ancestor's scrollable overflow, so
            // the old translate(-50%,-50%) approach would have made the
            // grid scroll to nowhere. Margins are real layout, so the
            // browser still knows how far there is to scroll.
            marginLeft: `-${(WALL_WIDTH_VW - 100) / 2}vw`,
            marginTop: `-${(WALL_HEIGHT_VH - 100) / 2}dvh`,
            gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            gap: 3,
            background: "var(--l-canvas)",
            transform: `rotate(${GRID_ROTATION_DEG}deg)`,
          }}
        >
          {BACKGROUND_TILES.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className="group relative hover:z-10"
              style={{ aspectRatio: "4 / 5" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="size-full object-cover transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
              />
              <div className="pointer-events-none absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100">
                <span className="flex size-9 items-center justify-center rounded-full" style={{ background: "rgba(17, 17, 17, 0.85)" }}>
                  <Pencil className="size-4" style={{ color: "#fff" }} strokeWidth={2} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrim lives outside the scroll container (a sibling, not a
          descendant) so it stays pinned over the viewport instead of
          scrolling away with the wall — pointer-events-none so it doesn't
          block hover/scroll from reaching the tiles underneath it. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "linear-gradient(100deg, var(--l-canvas) 0%, var(--l-canvas) 42%, rgba(255,255,255,0.55) 68%, rgba(255,255,255,0.1) 100%)" }}
      />

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
