"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OFFER_TYPE_ICON } from "@/components/offer-card/icons";
import { formatPrice, type OfferType, type PriceUnit } from "@/lib/pricing";

const TYPE_OPTIONS: OfferType[] = ["MEMBERSHIP", "COURSE", "COACHING", "CONSULTING", "FREE"];
const TYPE_STYLE: Record<OfferType, { bg: string; fg: string }> = {
  MEMBERSHIP: { bg: "rgba(226,104,12,.1)", fg: "#c25a0a" },
  COURSE: { bg: "rgba(107,87,224,.1)", fg: "#6b57e0" },
  COACHING: { bg: "rgba(226,104,12,.1)", fg: "#c25a0a" },
  CONSULTING: { bg: "rgba(94,113,134,.1)", fg: "#5e7186" },
  FREE: { bg: "var(--canvas-soft)", fg: "var(--ink-500)" },
  OTHER: { bg: "var(--canvas-soft)", fg: "var(--ink-500)" },
};

export interface OfferRowData {
  id: string;
  name: string;
  type: OfferType;
  priceCents: number | null;
  priceUnit: PriceUnit;
  description: string | null;
  lastSyncedAt: string | null;
  visible: boolean;
  isFeatured: boolean;
}

async function patchOffer(id: string, data: Record<string, unknown>) {
  await fetch(`/api/offers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function OfferRow({ offer }: { offer: OfferRowData }) {
  const router = useRouter();
  const [description, setDescription] = useState(offer.description ?? "");
  const [visible, setVisible] = useState(offer.visible);
  const [type, setType] = useState(offer.type);
  const Icon = OFFER_TYPE_ICON[type];
  const style = TYPE_STYLE[type];

  return (
    <div className="flex items-center gap-3.5 p-3.5" style={{ borderTop: "1px solid var(--hairline)" }}>
      <span
        className="flex flex-none items-center justify-center rounded-md"
        style={{ width: 36, height: 36, background: style.bg, color: style.fg }}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink-900">{offer.name}</span>
          {offer.isFeatured && <span className="qbx-badge qbx-badge--brand">Featured</span>}
        </div>
        <div className="font-mono text-[11.5px] text-ink-500">{formatPrice(offer.priceCents, offer.priceUnit)}</div>
      </div>

      <select
        value={type}
        onChange={(e) => {
          const value = e.target.value as OfferType;
          setType(value);
          void patchOffer(offer.id, { type: value }).then(() => router.refresh());
        }}
        className="flex-none rounded-md border px-2 py-1.5 text-xs"
        style={{ borderColor: "var(--border-strong)", width: 110 }}
      >
        {TYPE_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => void patchOffer(offer.id, { description: description || null })}
        placeholder="Add a description"
        className="flex-none rounded-md border px-2 py-1.5 text-xs"
        style={{ borderColor: "var(--border-strong)", width: 200 }}
      />

      <div className="flex-none font-mono text-[11px] text-ink-400" style={{ width: 90 }}>
        {offer.lastSyncedAt ? new Date(offer.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
      </div>

      <label className="qbx-switch flex-none">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => {
            setVisible(e.target.checked);
            void patchOffer(offer.id, { visible: e.target.checked }).then(() => router.refresh());
          }}
        />
        <span className="qbx-switch__track">
          <span className="qbx-switch__thumb" />
        </span>
      </label>
    </div>
  );
}
