"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pencil } from "lucide-react";
import { SELF_SERVE_SIGNUP_SUPPORTED } from "@/lib/self-serve-signup";
import { PrimaryCta } from "./PrimaryCta";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HERO_COLLAGE_IMAGES: string[] = [
  "/personas/maya-rivera.jpg",
  "/personas/riley-park.jpg",
  "/personas/priya-nair.jpg",
  "/personas/jordan-reyes.jpg",
  "/personas/chronos-pro.jpg",
  "/personas/vocal-pro.jpg",
];

// Rotated once as a rigid unit (not per-tile), tile sizing/hover/edit-icon
// behavior all unchanged from the full-bleed version. What's different here:
// this wall now lives inside its own column (not an absolutely-positioned
// full-viewport background), and it's much taller than that column — the
// extra height below the fold is what the scroll-linked reveal scrubs
// through (see the ScrollTrigger below).
const GRID_ROTATION_DEG = -13;

// Fully explicit pixel grid — not a percentage of the column, and not
// auto-fill. A percentage width/height on a grid nested inside an
// `absolute inset-0` wrapper doesn't reliably resolve (the same class of
// issue the original full-bleed wall's own comments already flagged), and
// auto-fill's column count depends on the column's actual runtime width, so
// the total row count (and therefore the wall's height, i.e. the scroll
// distance the reveal scrubs through) wasn't something this component could
// predict or control — it came out 4x taller than intended the first time.
// GRID_COLUMNS x TILE_WIDTH_PX and ROWS_TO_RENDER x TILE_HEIGHT_PX are the
// wall's actual, deterministic total size; centering against the column's
// real (responsive) width happens via left:50% + translateX(-50%) instead
// of a computed margin, so it still works across viewport sizes.
const TILE_WIDTH_PX = 320;
const TILE_HEIGHT_PX = 400; // 4:5 aspect ratio
const GRID_COLUMNS = 12; // 3840px wide — comfortably covers rotation-overhang past any realistic column width
const ROWS_TO_RENDER = 7; // 2800px tall — a few screens' worth of reveal travel; tune by feel once real

// (row + col) % images.length instead of a flat index — keeps the same
// image from repeating twice in any single row.
const BACKGROUND_TILES = Array.from({ length: ROWS_TO_RENDER }, (_, row) =>
  Array.from({ length: GRID_COLUMNS }, (_, col) => HERO_COLLAGE_IMAGES[(row + col) % HERO_COLLAGE_IMAGES.length])
).flat();

export function Hero() {
  const [handle, setHandle] = useState("");
  const ctaLabel = handle.trim() ? "Claim your account" : "Get started free";

  const heroSectionRef = useRef<HTMLDivElement>(null);
  const imageWallRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      // Entrance fade — unchanged from the full-bleed version.
      gsap.from(tileRefs.current, {
        opacity: 0,
        stagger: { amount: 1.2, from: "random" },
        duration: 0.5,
        ease: "power1.out",
      });

      // Scroll-linked reveal: the hero pins for a scroll distance equal to
      // how much taller the wall is than its own column, and the wall
      // translates upward by exactly that distance over that range — one
      // continuous motion tied to scroll position (scrub: true), not a
      // nested overflow-y scroll zone with its own separate gate. `end` and
      // the animated `y` are both functions (not precomputed numbers) with
      // invalidateOnRefresh so a real resize (not just a zoom) — window
      // resize, orientation change — recalculates the actual reveal
      // distance from the live rendered layout instead of a stale value.
      if (imageWallRef.current && heroSectionRef.current) {
        const revealDistance = () => {
          const wall = imageWallRef.current;
          const section = heroSectionRef.current;
          if (!wall || !section) return 0;
          return Math.max(0, wall.scrollHeight - section.offsetHeight);
        };

        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: "top top",
          end: () => `+=${revealDistance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          animation: gsap.to(imageWallRef.current, {
            y: () => -revealDistance(),
            ease: "none",
          }),
        });
      }
    },
    { scope: heroSectionRef }
  );

  return (
    <section id="top" ref={heroSectionRef} className="relative isolate flex h-dvh flex-col overflow-hidden lg:flex-row lg:items-stretch">
      <div className="relative z-10 flex flex-none flex-col justify-center px-8 py-10 lg:w-[46%] lg:max-w-[600px] lg:px-16 lg:py-0">
        <h1
          className="m-0 font-bold"
          style={{
            fontFamily: "var(--l-font-display)",
            fontSize: "clamp(38px, 6.4vw, 84px)",
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
          {SELF_SERVE_SIGNUP_SUPPORTED && (
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
          )}
          <PrimaryCta handle={handle.trim() || undefined}>{ctaLabel}</PrimaryCta>
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

      {/* Image column: overflow-hidden, not overflow-y-auto — the wall's
          position is driven entirely by the ScrollTrigger-scrubbed
          transform above, not native scrolling, so there's no scroll
          container here to hand off from. */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Left-edge fade: blends the wall into the text column's background
            at the seam between the two columns. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 lg:w-40"
          style={{ background: "linear-gradient(90deg, var(--l-canvas) 0%, rgba(255,255,255,0) 100%)" }}
        />

        <div ref={imageWallRef} className="absolute inset-0" aria-hidden="true">
          <div
            className="grid absolute"
            style={{
              left: "50%",
              top: -64, // small fixed overhang so rotation doesn't leave a gap at the top edge
              width: GRID_COLUMNS * TILE_WIDTH_PX,
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${TILE_WIDTH_PX}px)`,
              gridTemplateRows: `repeat(${ROWS_TO_RENDER}, ${TILE_HEIGHT_PX}px)`,
              gap: 3,
              background: "var(--l-canvas)",
              transform: `translateX(-50%) rotate(${GRID_ROTATION_DEG}deg)`,
            }}
          >
            {BACKGROUND_TILES.map((src, i) => (
              <div
                key={i}
                ref={(el) => {
                  tileRefs.current[i] = el;
                }}
                className="group relative hover:z-10"
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
      </div>
    </section>
  );
}
