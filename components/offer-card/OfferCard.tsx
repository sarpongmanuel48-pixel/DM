import Link from "next/link";
import { OFFER_TYPE_ICON, CustomLinkIcon } from "./icons";
import { ctaLabelFor, formatPrice, type OfferType, type PriceUnit } from "@/lib/pricing";

export interface OfferCardData {
  id: string;
  type: OfferType | "CUSTOM";
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  priceCents: number | null;
  priceUnit: PriceUnit;
  meta?: string | null; // e.g. "1,240 members" — optional social proof, featured only
  href: string; // /api/go/[offerId] for Whop offers, the raw url for custom links
}

const TILE_STYLE: Record<OfferType | "CUSTOM", { bg: string; fg: string }> = {
  MEMBERSHIP: { bg: "rgba(226,104,12,.09)", fg: "#c25a0a" },
  COURSE: { bg: "rgba(107,87,224,.1)", fg: "#6b57e0" },
  COACHING: { bg: "rgba(226,104,12,.09)", fg: "#c25a0a" },
  CONSULTING: { bg: "rgba(94,113,134,.1)", fg: "#5e7186" },
  FREE: { bg: "var(--canvas-soft)", fg: "var(--ink-500)" },
  CUSTOM: { bg: "var(--canvas-soft)", fg: "var(--ink-700)" },
};

const TYPE_LABEL: Record<OfferType | "CUSTOM", string> = {
  MEMBERSHIP: "Membership",
  COURSE: "Course",
  COACHING: "Coaching",
  CONSULTING: "Consulting",
  FREE: "Free",
  CUSTOM: "Custom link",
};

function TypeIcon({ type, className }: { type: OfferType | "CUSTOM"; className?: string }) {
  const Icon = type === "CUSTOM" ? CustomLinkIcon : OFFER_TYPE_ICON[type];
  return <Icon className={className} />;
}

/**
 * One component, two sizes (spec sheet 4F). Featured is used once, at the
 * top of the storefront; Standard carries everything else — the rest of
 * the offers grid and the dashboard's editor/offers lists.
 */
export function OfferCard({ offer, size }: { offer: OfferCardData; size: "featured" | "standard" }) {
  const isFree = offer.type === "FREE";
  const isCustom = offer.type === "CUSTOM";
  const tile = TILE_STYLE[offer.type];

  if (size === "featured") {
    return (
      <Link
        href={offer.href}
        className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-sm no-underline"
      >
        <div
          className="bg-cover bg-center"
          style={{
            height: 132,
            backgroundColor: "var(--canvas-soft)",
            backgroundImage: offer.thumbnailUrl ? `url(${offer.thumbnailUrl})` : undefined,
          }}
        />
        <div className="flex flex-col gap-2.5 p-4">
          <div className="flex items-center gap-2">
            <span className="qbx-badge qbx-badge--accent">{TYPE_LABEL[offer.type]}</span>
            {offer.meta && <span className="text-xs text-ink-400">{offer.meta}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-display text-xl font-bold tracking-tight text-ink-900">{offer.name}</div>
            {offer.description && <div className="text-sm text-ink-700">{offer.description}</div>}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <PriceBlock offer={offer} />
            <span className="qbx-btn qbx-btn--md qbx-btn--accent ml-auto">{ctaLabelFor(offer.type)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={offer.href}
      className="flex items-center gap-3 rounded-lg border p-3.5 no-underline"
      style={{
        borderColor: isFree ? "var(--hairline-strong)" : "var(--hairline)",
        borderStyle: isFree ? "dashed" : "solid",
        background: isFree ? "transparent" : "#fff",
      }}
    >
      <div
        className="flex flex-none items-center justify-center rounded-md"
        style={{ background: tile.bg, color: tile.fg, width: 46, height: 46 }}
      >
        <TypeIcon type={offer.type} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={isFree ? "text-[14.5px] font-medium text-ink-800" : "text-[15px] font-semibold text-ink-900"}>
          {offer.name}
        </div>
        {offer.description && (
          <div className="truncate text-[12.5px] text-ink-500">{offer.description}</div>
        )}
        {!isCustom && (
          <div className="mt-0.5 text-[12.5px] text-ink-700">{formatPrice(offer.priceCents, offer.priceUnit)}</div>
        )}
      </div>
      <span
        className={isFree ? "qbx-btn qbx-btn--sm" : "qbx-btn qbx-btn--sm qbx-btn--accent-outline"}
        style={isFree ? { background: "var(--canvas-soft)", color: "var(--ink-700)" } : undefined}
      >
        {ctaLabelFor(offer.type)}
      </span>
    </Link>
  );
}

function PriceBlock({ offer }: { offer: OfferCardData }) {
  if (offer.type === "FREE" || offer.priceCents === 0) return null;
  if (offer.priceUnit === "RECURRING_MONTH" && offer.priceCents != null) {
    const dollars = offer.priceCents / 100;
    return (
      <div className="text-sm text-ink-700">
        <span className="font-display text-lg font-semibold text-ink-900">
          ${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}
        </span>
        /mo
      </div>
    );
  }
  return <div className="text-sm text-ink-700">{formatPrice(offer.priceCents, offer.priceUnit)}</div>;
}
