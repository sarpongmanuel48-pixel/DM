"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OFFER_TYPE_ICON } from "@/components/offer-card/icons";
import { formatPrice, type OfferType, type PriceUnit } from "@/lib/pricing";

export interface EditorOffer {
  id: string;
  name: string;
  type: OfferType;
  priceCents: number | null;
  priceUnit: PriceUnit;
  visible: boolean;
  sortOrder: number;
}

async function patchOffer(id: string, data: Record<string, unknown>) {
  await fetch(`/api/offers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** 3B's offer list — visibility toggles and a "make featured" action per
 * row. Reordering is up/down buttons rather than drag-and-drop (no DnD
 * library dependency added for this pass); same end result. */
export function EditorOfferList({ offers: initial, featuredOfferId }: { offers: EditorOffer[]; featuredOfferId: string | null }) {
  const router = useRouter();
  const [offers, setOffers] = useState(initial);
  const [featured, setFeatured] = useState(featuredOfferId);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= offers.length) return;
    const next = [...offers];
    [next[index], next[target]] = [next[target], next[index]];
    setOffers(next);
    await Promise.all([
      patchOffer(next[index].id, { sortOrder: index }),
      patchOffer(next[target].id, { sortOrder: target }),
    ]);
    router.refresh();
  }

  async function toggleVisible(id: string, visible: boolean) {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, visible } : o)));
    await patchOffer(id, { visible });
    router.refresh();
  }

  async function makeFeatured(id: string) {
    setFeatured(id);
    await fetch(`/api/offers/${id}/feature`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {offers.map((offer, i) => {
        const Icon = OFFER_TYPE_ICON[offer.type];
        const isFeatured = offer.id === featured;
        return (
          <div
            key={offer.id}
            className="flex items-center gap-3 rounded-lg border p-3"
            style={{ borderColor: isFeatured ? "var(--action-primary)" : "var(--hairline)", opacity: offer.visible ? 1 : 0.55 }}
          >
            <div className="flex flex-none flex-col gap-0.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="qbx-iconbtn qbx-iconbtn--ghost qbx-iconbtn--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === offers.length - 1} className="qbx-iconbtn qbx-iconbtn--ghost qbx-iconbtn--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <span
              className="flex flex-none items-center justify-center rounded-md"
              style={{ width: 34, height: 34, background: "var(--canvas-soft)", color: "var(--ink-500)" }}
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold text-ink-900">{offer.name}</span>
                {isFeatured && <span className="qbx-badge qbx-badge--brand">Featured</span>}
              </div>
              <div className="font-mono text-[11px] text-ink-500">{formatPrice(offer.priceCents, offer.priceUnit)}</div>
            </div>

            {!isFeatured && (
              <button type="button" onClick={() => makeFeatured(offer.id)} className="qbx-btn qbx-btn--utility flex-none">
                Make featured
              </button>
            )}

            <label className="qbx-switch flex-none">
              <input type="checkbox" checked={offer.visible} onChange={(e) => toggleVisible(offer.id, e.target.checked)} />
              <span className="qbx-switch__track">
                <span className="qbx-switch__thumb" />
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
