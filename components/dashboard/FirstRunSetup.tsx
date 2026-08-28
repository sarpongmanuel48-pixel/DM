"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, type OfferType, type PriceUnit } from "@/lib/pricing";
import { isReservedHandle, isValidHandleFormat } from "@/lib/reserved-handles";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  OTHER: "Other",
};

/**
 * The dashboard's first-run experience — folds the old standalone
 * onboarding screens (2B import, 2C choose-featured + claim handle, 2D
 * confirmation) into one in-place flow, since there's no separate
 * pre-dashboard onboarding anymore: installing the app on Whop *is* the
 * "sign up" and "connect Whop" steps now.
 */
export function FirstRunSetup({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [offers, setOffers] = useState<StreamedOffer[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const [featuredOfferId, setFeaturedOfferId] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const source = new EventSource(`/api/dashboard/${companyId}/import-stream`);
    source.addEventListener("offer", (event) => {
      const offer = JSON.parse((event as MessageEvent).data) as StreamedOffer;
      setOffers((prev) => [...prev, offer]);
    });
    source.addEventListener("done", () => {
      setImportDone(true);
      source.close();
    });
    source.addEventListener("error", (event) => {
      const message = (event as MessageEvent).data
        ? (JSON.parse((event as MessageEvent).data) as { message: string }).message
        : "Import failed — try again.";
      setImportError(message);
      source.close();
    });

    return () => source.close();
  }, [companyId]);

  useEffect(() => {
    if (!handle) {
      return;
    }
    const timeout = setTimeout(async () => {
      if (!isValidHandleFormat(handle) || isReservedHandle(handle)) {
        setHandleStatus("unavailable");
        return;
      }
      setHandleStatus("checking");
      const res = await fetch(`/api/handle-availability?handle=${encodeURIComponent(handle)}`);
      const data = (await res.json()) as { available: boolean };
      setHandleStatus(data.available ? "available" : "unavailable");
    }, 350);
    return () => clearTimeout(timeout);
  }, [handle]);

  async function publish() {
    setPublishing(true);
    setPublishError(null);
    const res = await fetch(`/api/dashboard/${companyId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, featuredOfferId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPublishError(typeof body.error === "string" ? body.error : "Couldn't publish — try a different handle.");
      setPublishing(false);
      return;
    }
    router.refresh();
  }

  const canPublish = importDone && handleStatus === "available" && !publishing;

  return (
    <main className="min-h-screen bg-canvas">
      <div className="flex justify-center px-6 py-10">
        <div className="flex w-full max-w-[640px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Set up your page</div>
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">
              {importDone ? "Choose your start-here offer" : "Pulling in your products"}
            </h1>
            <p className="text-[14.5px] text-ink-700">
              {importDone
                ? "It sits at the top of your page, larger than everything else. You can change it any time."
                : "This takes a few seconds — reading your Whop catalog."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center gap-3.5 rounded-lg border border-hairline bg-white p-3.5 shadow-sm">
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

            {!importDone && !importError && (
              <div className="flex items-center gap-3.5 rounded-lg border border-dashed p-3.5" style={{ borderColor: "var(--hairline-strong)" }}>
                <span
                  className="flex-none rounded-full"
                  style={{ width: 20, height: 20, border: "2px solid var(--hairline-strong)", borderTopColor: "var(--action-primary)", animation: "dm-spin 0.8s linear infinite" }}
                />
                <div className="h-2.5 w-40 rounded-full" style={{ background: "var(--canvas-soft)" }} />
              </div>
            )}
            {importError && (
              <div className="rounded-md p-3 text-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                {importError}
              </div>
            )}
          </div>

          {importDone && (
            <>
              <fieldset className="grid grid-cols-2 gap-3">
                {offers.map((offer) => (
                  <label
                    key={offer.id}
                    className="flex cursor-pointer flex-col gap-1.5 rounded-lg border-2 bg-white p-3.5"
                    style={{ borderColor: featuredOfferId === offer.id ? "var(--action-primary)" : "var(--hairline)" }}
                  >
                    <input
                      type="radio"
                      name="featuredOfferId"
                      className="sr-only"
                      checked={featuredOfferId === offer.id}
                      onChange={() => setFeaturedOfferId(offer.id)}
                    />
                    <span className="text-[9.5px] font-semibold uppercase tracking-widest text-ink-500">
                      {TYPE_LABEL[offer.type]}
                    </span>
                    <span className="text-[14.5px] font-semibold leading-tight text-ink-900">{offer.name}</span>
                    <span className="font-mono text-xs text-ink-700">{formatPrice(offer.priceCents, offer.priceUnit)}</span>
                  </label>
                ))}
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <Label>Your page address</Label>
                <div
                  className="flex items-center overflow-hidden rounded-md border bg-white"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <span className="pl-3 py-2.5 font-mono text-sm text-ink-400">dm.to/</span>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase())}
                    className="flex-1 py-2.5 pr-3 font-mono text-sm outline-none"
                    placeholder="yourhandle"
                  />
                  {handleStatus === "available" && (
                    <span className="pr-3.5 text-xs font-medium" style={{ color: "var(--success)" }}>
                      Available
                    </span>
                  )}
                  {handleStatus === "unavailable" && (
                    <span className="pr-3.5 text-xs font-medium" style={{ color: "var(--danger)" }}>
                      Taken
                    </span>
                  )}
                </div>
              </div>

              {publishError && (
                <div className="rounded-md p-3 text-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                  {publishError}
                </div>
              )}

              <Button
                type="button"
                disabled={!canPublish}
                onClick={publish}
                className="w-full text-[17px]"
              >
                {publishing ? "Publishing…" : "Publish my page"}
              </Button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes dm-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
