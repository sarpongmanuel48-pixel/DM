"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { siShopify, siGumroad, siPatreon, siLemonsqueezy, siKofi, siSubstack, siEtsy, type SimpleIcon } from "simple-icons";

gsap.registerPlugin(useGSAP);

type BrandMarkData = { hex: string; path: string; viewBox?: string };

function fromSimpleIcon(icon: SimpleIcon): BrandMarkData {
  return { hex: icon.hex, path: icon.path };
}

// simple-icons has no Whop entry, so this is hand-extracted from the brand
// asset at public/brand/whop.svg (the source file kept there verbatim) —
// just the icon mark's compound sub-path, pulled out from the flattened
// wordmark+background artwork, recolored to Whop's brand orange to match
// the flat-glyph treatment used for every other logo here. viewBox is the
// mark's own bounding box within that source file's coordinate space, not
// the standard 0 0 24 24 the simple-icons marks use.
const WHOP_MARK: BrandMarkData = {
  hex: "FA4616",
  viewBox: "240 135 118 65",
  path: "M262.011 140c-7.032 0-11.88 3.087-15.548 6.578 0 0-1.482 1.404-1.463 1.447l15.407 15.413 15.404-15.413c-2.917-4.018-8.417-8.025-13.8-8.025m38.043 0c-7.032 0-11.88 3.087-15.549 6.578 0 0-1.352 1.367-1.414 1.447l-19.043 19.054 15.383 15.389 34.423-34.443c-2.918-4.018-8.415-8.025-13.8-8.025m38.147 0c-7.032 0-11.88 3.087-15.548 6.578 0 0-1.41 1.377-1.463 1.447l-38.094 38.116 4.032 4.034c6.238 6.24 16.449 6.24 22.688 0l42.137-42.15h.048c-2.917-4.018-8.415-8.025-13.8-8.025",
};

const PLATFORMS: { name: string; icon: BrandMarkData }[] = [
  { name: "Whop", icon: WHOP_MARK },
  { name: "Shopify", icon: fromSimpleIcon(siShopify) },
  { name: "Gumroad", icon: fromSimpleIcon(siGumroad) },
  { name: "Patreon", icon: fromSimpleIcon(siPatreon) },
  { name: "Lemon Squeezy", icon: fromSimpleIcon(siLemonsqueezy) },
  { name: "Ko-fi", icon: fromSimpleIcon(siKofi) },
  { name: "Substack", icon: fromSimpleIcon(siSubstack) },
  { name: "Etsy", icon: fromSimpleIcon(siEtsy) },
];

function BrandMark({ mark, title }: { mark: BrandMarkData; title: string }) {
  const viewBox = mark.viewBox ?? "0 0 24 24";
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  const height = 22;
  const width = Math.round((vw / vh) * height);
  return (
    <svg role="img" aria-label={`${title} logo`} viewBox={viewBox} width={width} height={height} fill={`#${mark.hex}`}>
      <path d={mark.path} />
    </svg>
  );
}

// Matches the old `landing-scroll-left 34s` keyframe speed.
const MARQUEE_DURATION_S = 34;

export function IntegrationsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      tweenRef.current = gsap.to(trackRef.current, {
        xPercent: -50,
        duration: MARQUEE_DURATION_S,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-16 pb-24" style={{ borderTop: "1px solid var(--l-hairline-soft)" }}>
      <p
        className="mx-auto max-w-[640px] px-8 text-center font-bold"
        style={{ fontFamily: "var(--l-font-display)", fontSize: 24, lineHeight: 1.2, color: "var(--l-ink)" }}
      >
        Integrate your account or product from Whop, Shopify, Gumroad, Patreon, and more.
      </p>
      <div
        className="mt-12 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.play()}
      >
        <div ref={trackRef} className="flex w-max gap-12">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center gap-12 pr-12">
              {PLATFORMS.map((platform) => (
                <span
                  key={platform.name}
                  className="flex items-center gap-2.5 rounded-full px-1 py-2.5 text-xl font-semibold whitespace-nowrap"
                  style={{ fontFamily: "var(--l-font-display)", color: "var(--l-ink)" }}
                >
                  {/* Scoped exception to the clickable-only color rule: these
                      are literal external brand marks, not DM's own
                      iconography, so they render in their real brand color —
                      unlike the share-anywhere card stack's platform badges,
                      which are DM's own monochrome glyphs, not the actual mark. */}
                  <BrandMark mark={platform.icon} title={platform.name} />
                  {platform.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
