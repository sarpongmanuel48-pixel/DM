"use client";

import { useEffect, useState } from "react";
import { SELF_SERVE_SIGNUP_SUPPORTED, WHOP_APP_STORE_URL } from "@/lib/self-serve-signup";

// Persona mockups (Jordan Reyes, Maya Rivera, Alex Chen, Sam Okafor, Riley
// Park, +2 more) are being generated separately and aren't ready yet.
// Dropping their file paths in here — in this order — is the only change
// needed once they exist; tiles beyond the array's length fall back to
// the placeholder card look.
const HERO_COLLAGE_IMAGES: string[] = [];

// A loose grid mosaic, not a scattered/rotated collage — per the reference
// screenshot, tiles are axis-aligned and tiled (uneven spans, small gaps)
// rather than independently rotated. One tile is the "focus" tile: full
// detail, fully sharp. Every other tile reads as out-of-focus background —
// blurred, flatter — the same relationship the reference's one crisp photo
// has to its softened pastel neighbors. Opacity still animates in on mount,
// staggered per tile, per the confirmed reference video — that part is
// unchanged, only the static composition is.
const TILE_LAYOUT: { column: string; row: string; focus?: boolean; tint?: string }[] = [
  { column: "1 / 2", row: "1 / 2", tint: "var(--l-hairline)" },
  { column: "2 / 4", row: "1 / 2", tint: "rgba(109, 99, 234, 0.14)" },
  { column: "1 / 2", row: "2 / 4", tint: "var(--l-hairline)" },
  { column: "2 / 3", row: "2 / 4", focus: true },
  { column: "3 / 4", row: "2 / 3", tint: "rgba(79, 70, 229, 0.12)" },
  { column: "3 / 4", row: "3 / 4", tint: "var(--l-hairline)" },
  // Full-width, not "1 / 3" — closes the composition against both outer
  // edges instead of stopping short under the right column.
  { column: "1 / 4", row: "4 / 5", tint: "rgba(109, 99, 234, 0.1)" },
];

const FADE_IN_STAGGER_MS = 130;

export function Hero() {
  const [handle, setHandle] = useState("");
  const ctaLabel = handle.trim() ? "Claim your account" : "Get started free";

  // Starts false on every mount (server-rendered and on hydration alike),
  // then flips true a frame later — so the fade-in replays on every page
  // load/reload rather than firing once per browser.
  const [collageVisible, setCollageVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setCollageVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
        className="grid h-[520px] overflow-hidden"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: 12 }}
      >
        {TILE_LAYOUT.map((tile, i) => (
          <div
            key={i}
            className="transition-opacity ease-out"
            style={{
              gridColumn: tile.column,
              gridRow: tile.row,
              opacity: collageVisible ? 1 : 0,
              transitionDuration: "700ms",
              transitionDelay: `${i * FADE_IN_STAGGER_MS}ms`,
            }}
          >
            <CollageTile src={HERO_COLLAGE_IMAGES[i]} focus={tile.focus} tint={tile.tint} />
          </div>
        ))}
      </div>
    </section>
  );
}

// The frame (border + shadow) stays fully opaque on every tile, focus or
// not — a real, visible card boundary regardless of what's inside it.
const TILE_FRAME_STYLE = {
  background: "var(--l-canvas)",
  boxShadow: "0 1px 2px rgba(17, 17, 17, 0.04), 0 4px 12px rgba(17, 17, 17, 0.05)",
  border: "1px solid rgba(17, 17, 17, 0.05)",
};

// Scaled up before blurring so the blur's outward bleed lands on the
// (overflow-hidden) frame's own edge instead of leaving a hard seam where
// the unblurred rectangle used to end.
const BACKGROUND_TILE_STYLE = { filter: "blur(6px)", transform: "scale(1.15)" };

function CollageTile({ src, focus, tint }: { src?: string; focus?: boolean; tint?: string }) {
  if (src) {
    return (
      <div className="size-full overflow-hidden rounded-lg" style={TILE_FRAME_STYLE}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="size-full object-cover" style={focus ? undefined : BACKGROUND_TILE_STYLE} />
      </div>
    );
  }

  if (focus) {
    // The one in-focus tile — full detail, fully sharp, no blur.
    return (
      <div className="flex size-full flex-col gap-2 overflow-hidden rounded-lg p-3" style={TILE_FRAME_STYLE}>
        <div className="size-[26px] rounded-full" style={{ background: "var(--l-surface-card)" }} />
        <div className="h-[6px] w-[70%] rounded-[3px]" style={{ background: "var(--l-stone)" }} />
        <div className="h-[6px] w-[45%] rounded-[3px]" style={{ background: "var(--l-hairline-soft)" }} />
        <div className="mt-auto h-5 rounded-md" style={{ background: "var(--l-indigo)" }} />
      </div>
    );
  }

  // Background tile — a flat tint, blurred. Skeleton-bar detail would just
  // get lost to the blur anyway, so there's no point drawing it.
  return (
    <div className="size-full overflow-hidden rounded-lg" style={TILE_FRAME_STYLE}>
      <div className="size-full" style={{ background: tint, ...BACKGROUND_TILE_STYLE }} />
    </div>
  );
}
