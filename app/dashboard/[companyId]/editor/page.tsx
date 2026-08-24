import { prisma } from "@/lib/prisma";
import { EditorOfferList } from "@/components/dashboard/EditorOfferList";
import { LinksEditor } from "@/components/dashboard/LinksEditor";
import { LivePreviewPane } from "@/components/dashboard/LivePreviewPane";
import { SaveIdentityForm } from "@/components/dashboard/SaveIdentityForm";
import type { OfferCardData } from "@/components/offer-card/OfferCard";

// 3B — identity fields, offer list, custom links, live preview pane.
export default async function EditorPage({ params }: PageProps<"/dashboard/[companyId]/editor">) {
  const { companyId } = await params;
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { whopCompanyId: companyId },
    include: { offers: { orderBy: { sortOrder: "asc" } }, links: { orderBy: { sortOrder: "asc" } } },
  });

  const toCard = (offer: (typeof creator.offers)[number]): OfferCardData => ({
    id: offer.id,
    type: offer.type,
    name: offer.name,
    description: offer.description,
    thumbnailUrl: offer.thumbnailUrl,
    priceCents: offer.priceCents,
    priceUnit: offer.priceUnit,
    href: `/api/go/${offer.id}`,
  });

  const featured = creator.offers.find((o) => o.id === creator.featuredOfferId);
  const rest = creator.offers.filter((o) => o.visible && o.id !== creator.featuredOfferId);

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
      <div className="flex flex-col gap-4">
        <SaveIdentityForm
          creatorId={creator.id}
          defaultName={creator.name}
          defaultTagline={creator.tagline ?? ""}
          defaultBio={creator.bio ?? ""}
          defaultAvatarUrl={creator.avatarUrl}
        />

        <div className="rounded-lg border border-hairline bg-white p-5">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-ink-900">Offers</h2>
            <span className="font-mono text-[11px] text-ink-400">reorder · toggle · feature</span>
          </div>
          <EditorOfferList
            offers={creator.offers.map((o) => ({
              id: o.id,
              name: o.name,
              type: o.type,
              priceCents: o.priceCents,
              priceUnit: o.priceUnit,
              visible: o.visible,
              sortOrder: o.sortOrder,
            }))}
            featuredOfferId={creator.featuredOfferId}
          />
        </div>

        <div className="rounded-lg border border-hairline bg-white p-5">
          <h2 className="mb-3.5 text-[13.5px] font-semibold text-ink-900">Custom links</h2>
          <LinksEditor companyId={companyId} links={creator.links.map((l) => ({ id: l.id, label: l.label, url: l.url }))} />
        </div>
      </div>

      <LivePreviewPane
        creator={{ name: creator.name, tagline: creator.tagline, bio: creator.bio, avatarUrl: creator.avatarUrl }}
        featured={featured ? toCard(featured) : undefined}
        rest={rest.map(toCard)}
      />
    </div>
  );
}
