import { prisma } from "@/lib/prisma";
import { requireCreatorForPage } from "@/lib/standalone-auth";
import { DEFAULT_ACCENT_COLOR } from "@/lib/creator-accent";
import { AppearanceForm } from "@/components/dashboard/AppearanceForm";
import { EditorOfferList } from "@/components/dashboard/EditorOfferList";
import { LinksEditor } from "@/components/dashboard/LinksEditor";
import { LivePreviewPane } from "@/components/dashboard/LivePreviewPane";
import { SaveIdentityForm } from "@/components/dashboard/SaveIdentityForm";
import type { OfferCardData } from "@/components/offer-card/OfferCard";

/**
 * Standalone analogue of app/dashboard/[companyId]/editor/page.tsx —
 * identical form/preview layout, session-based identity instead of a
 * companyId route param. SaveIdentityForm, AppearanceForm, EditorOfferList,
 * and LivePreviewPane are already companyId-agnostic and need no changes;
 * LinksEditor gets apiBase instead of companyId (see LinksEditor.tsx).
 */
export default async function StandaloneEditorPage() {
  const creatorId = (await requireCreatorForPage()).id;
  const creator = await prisma.creator.findUniqueOrThrow({
    where: { id: creatorId },
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

        <AppearanceForm creatorId={creator.id} accentColor={creator.accentColor ?? DEFAULT_ACCENT_COLOR} />

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
          <LinksEditor apiBase="/api/app/links" links={creator.links.map((l) => ({ id: l.id, label: l.label, url: l.url }))} />
        </div>
      </div>

      <LivePreviewPane
        creator={{ name: creator.name, tagline: creator.tagline, bio: creator.bio, avatarUrl: creator.avatarUrl }}
        accentColor={creator.accentColor ?? DEFAULT_ACCENT_COLOR}
        featured={featured ? toCard(featured) : undefined}
        rest={rest.map(toCard)}
      />
    </div>
  );
}
