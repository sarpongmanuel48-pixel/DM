import { OfferCard, type OfferCardData } from "@/components/offer-card/OfferCard";

interface PreviewCreator {
  name: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

/** A scaled-down read of the real storefront data — reflects saved state
 * (offer order/visibility/featured update live via router.refresh(); the
 * identity fields update once the form above is saved). */
export function LivePreviewPane({
  creator,
  featured,
  rest,
}: {
  creator: PreviewCreator;
  featured?: OfferCardData;
  rest: OfferCardData[];
}) {
  const initials = creator.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="sticky top-20 flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">Live preview</div>
      <div
        className="overflow-y-auto rounded-2xl border p-3.5"
        style={{ borderColor: "var(--hairline-strong)", background: "var(--canvas)", height: 560 }}
      >
        <div className="flex flex-col items-center gap-2 pb-4 pt-2 text-center">
          {creator.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creator.avatarUrl} alt="" className="rounded-full object-cover" style={{ width: 52, height: 52 }} />
          ) : (
            <div className="qbx-avatar qbx-avatar--md">{initials}</div>
          )}
          <div className="font-display text-[15px] font-bold tracking-tight text-ink-900">{creator.name}</div>
          {creator.tagline && <div className="text-[11px] font-medium text-accent-ink">{creator.tagline}</div>}
          {creator.bio && <p className="max-w-[210px] text-[10.5px] text-ink-600">{creator.bio}</p>}
        </div>

        <div className="flex flex-col gap-2.5" style={{ fontSize: 12 }}>
          {featured && (
            <div style={{ transform: "scale(0.92)", transformOrigin: "top center" }}>
              <OfferCard offer={featured} size="featured" />
            </div>
          )}
          {rest.map((offer) => (
            <OfferCard key={offer.id} offer={offer} size="standard" />
          ))}
        </div>
      </div>
    </div>
  );
}
