import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { OfferCard, type OfferCardData } from "@/components/offer-card/OfferCard";
import { PreviewBanner } from "@/components/storefront/PreviewBanner";
import { SocialLinks } from "@/components/storefront/SocialLinks";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { EmptyOffersCard } from "@/components/storefront/EmptyOffersCard";

const SECTION_LABEL: Record<string, string> = {
  MEMBERSHIP: "Memberships",
  COURSE: "Courses",
  COACHING: "Coaching",
  CONSULTING: "Consulting",
  FREE: "Free",
};
const SECTION_ORDER = ["MEMBERSHIP", "COURSE", "COACHING", "CONSULTING", "FREE"];

/** The storefront — card stack (1A). Public, unauthenticated. */
export default async function StorefrontPage({ params }: PageProps<"/[handle]">) {
  const { handle } = await params;

  const creator = await prisma.creator.findUnique({
    where: { handle },
    include: {
      offers: { where: { visible: true }, orderBy: { sortOrder: "asc" } },
      links: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!creator) notFound();

  const isPreview = !creator.publishedAt;
  if (!isPreview) {
    const headerList = await headers();
    await prisma.clickEvent.create({
      data: { creatorId: creator.id, referrer: headerList.get("referer") },
    });
  }

  const featured = creator.offers.find((o) => o.id === creator.featuredOfferId);
  const sections = SECTION_ORDER.map((type) => ({
    type,
    label: SECTION_LABEL[type],
    offers: creator.offers.filter((o) => o.type === type && o.id !== creator.featuredOfferId),
  })).filter((section) => section.offers.length > 0);

  const initials = creator.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex min-h-screen flex-col items-center bg-canvas">
      {isPreview && <PreviewBanner />}

      <div className="flex w-full max-w-md flex-col items-center gap-3 px-5 pt-7">
        {creator.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.avatarUrl}
            alt=""
            className="rounded-full object-cover"
            style={{ width: 84, height: 84, boxShadow: "0 0 0 3px #fff, 0 0 0 4px var(--hairline)" }}
          />
        ) : (
          <div className="qbx-avatar qbx-avatar--lg qbx-avatar--ring">{initials}</div>
        )}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="font-display text-2xl font-bold tracking-tight text-ink-900">{creator.name}</div>
          {creator.tagline && <div className="text-sm font-medium text-accent-ink">{creator.tagline}</div>}
          {creator.bio ? (
            <p className="mt-1 max-w-[270px] text-sm text-ink-700">{creator.bio}</p>
          ) : isPreview ? (
            <p className="mt-1 max-w-[250px] text-sm text-ink-500">Add a bio in the editor and it shows up here.</p>
          ) : null}
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-7 px-5 pb-8 pt-6">
        {featured && (
          <section className="flex flex-col gap-2">
            <SectionHeading label="Start here" accent />
            <OfferCard offer={toCardData(featured)} size="featured" />
          </section>
        )}

        {sections.map((section) => (
          <section key={section.type} className="flex flex-col gap-2">
            <SectionHeading label={section.label} />
            <div className="flex flex-col gap-2">
              {section.offers.map((offer) => (
                <OfferCard key={offer.id} offer={toCardData(offer)} size="standard" />
              ))}
            </div>
          </section>
        ))}

        {creator.offers.length === 0 && <EmptyOffersCard />}

        {creator.links.length > 0 && <SocialLinks links={creator.links} />}

        <StorefrontFooter handle={creator.handle} />
      </div>
    </main>
  );
}

function SectionHeading({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: accent ? "var(--accent)" : "var(--ink-500)" }}
      >
        {label}
      </span>
      <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
    </div>
  );
}

function toCardData(offer: {
  id: string;
  source: string;
  type: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  priceCents: number | null;
  priceUnit: string;
}): OfferCardData {
  return {
    id: offer.id,
    type: offer.type as OfferCardData["type"],
    name: offer.name,
    description: offer.description,
    thumbnailUrl: offer.thumbnailUrl,
    priceCents: offer.priceCents,
    priceUnit: offer.priceUnit as OfferCardData["priceUnit"],
    href: `/api/go/${offer.id}`,
  };
}
