"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, type OfferType, type PriceUnit } from "@/lib/pricing";

interface StreamedOffer {
  id: string;
  name: string;
  type: OfferType;
  priceCents: number | null;
  priceUnit: PriceUnit;
}

const TYPE_LABEL: Record<OfferType, string> = {
  MEMBERSHIP: "Membership",
  COURSE: "Course",
  COACHING: "Coaching",
  CONSULTING: "Consulting",
  FREE: "Free",
};

/** 2B — products land one by one as the SSE stream from
 * /api/whop/import-stream delivers them, then redirects to 2C. */
export function ImportStream() {
  const router = useRouter();
  const [offers, setOffers] = useState<StreamedOffer[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const source = new EventSource("/api/whop/import-stream");

    source.addEventListener("offer", (event) => {
      const offer = JSON.parse((event as MessageEvent).data) as StreamedOffer;
      setOffers((prev) => [...prev, offer]);
    });

    source.addEventListener("done", () => {
      setDone(true);
      source.close();
      setTimeout(() => router.push("/onboarding/handle"), 700);
    });

    source.addEventListener("error", (event) => {
      const message = (event as MessageEvent).data
        ? (JSON.parse((event as MessageEvent).data) as { message: string }).message
        : "Import failed — try again.";
      setError(message);
      source.close();
    });

    return () => source.close();
  }, [router]);

  return (
    <div className="flex flex-col gap-2.5">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="flex items-center gap-3.5 rounded-lg border border-hairline bg-white p-3.5 shadow-sm"
        >
          <span
            className="flex flex-none items-center justify-center rounded-full"
            style={{ width: 20, height: 20, background: "var(--success-soft)", color: "var(--success)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l5 5L19 7" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold text-ink-900">{offer.name}</div>
            <div className="text-xs text-ink-500">{TYPE_LABEL[offer.type]}</div>
          </div>
          <div className="flex-none font-mono text-[13px] text-ink-800">
            {formatPrice(offer.priceCents, offer.priceUnit)}
          </div>
        </div>
      ))}

      {!done && !error && (
        <div className="flex items-center gap-3.5 rounded-lg border border-dashed p-3.5" style={{ borderColor: "var(--hairline-strong)" }}>
          <span
            className="flex-none rounded-full"
            style={{ width: 20, height: 20, border: "2px solid var(--hairline-strong)", borderTopColor: "var(--action-primary)", animation: "dm-spin 0.8s linear infinite" }}
          />
          <div className="flex-1">
            <div className="h-2.5 w-40 rounded-full" style={{ background: "var(--canvas-soft)" }} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md p-3 text-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-[11.5px] text-ink-400">
          {done ? "import complete" : "reading whop catalogue"}
        </span>
        <span className="font-mono text-xs text-ink-500">{offers.length} imported</span>
      </div>
      <style>{`@keyframes dm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
