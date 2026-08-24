import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { whopClientForCreator } from "@/lib/whop/client";
import { fetchAccountProfile, fetchOwnCompanyId, streamOffers } from "@/lib/whop/products";
import { ensureFreshAccessToken } from "@/lib/whop/sync";

/**
 * Backs 2B's live import — Server-Sent Events so the page can render each
 * product landing one at a time instead of a spinner that dumps the whole
 * list at the end. Each event also upserts the offer, so a page refresh
 * mid-import doesn't lose progress.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator || creator.whopConnectionStatus === "DISCONNECTED") {
    return NextResponse.json({ error: "not connected" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const accessToken = await ensureFreshAccessToken(creator);
        const client = whopClientForCreator(accessToken);
        const companyId = creator.whopCompanyId ?? (await fetchOwnCompanyId(client));

        const profile = await fetchAccountProfile(client, companyId);
        await prisma.creator.update({
          where: { id: creator.id },
          data: {
            whopConnectionStatus: "CONNECTED",
            whopCompanyId: profile.whopCompanyId,
            verified: profile.verified,
          },
        });

        let count = 0;
        for await (const offer of streamOffers(client, companyId)) {
          const existing = await prisma.offer.findUnique({
            where: { creatorId_whopProductId: { creatorId: creator.id, whopProductId: offer.whopProductId } },
          });

          const saved = await prisma.offer.upsert({
            where: { creatorId_whopProductId: { creatorId: creator.id, whopProductId: offer.whopProductId } },
            create: {
              creatorId: creator.id,
              source: "WHOP",
              whopProductId: offer.whopProductId,
              name: offer.name,
              priceCents: offer.priceCents,
              priceUnit: offer.priceUnit,
              type: offer.type,
              whopCheckoutUrl: offer.whopCheckoutUrl,
              description: offer.description,
              thumbnailUrl: offer.thumbnailUrl,
              sortOrder: count,
              lastSyncedAt: new Date(),
            },
            update: {
              name: offer.name,
              priceCents: offer.priceCents,
              priceUnit: offer.priceUnit,
              whopCheckoutUrl: offer.whopCheckoutUrl,
              lastSyncedAt: new Date(),
              ...(existing ? {} : { type: offer.type }),
            },
          });

          count += 1;
          send("offer", {
            id: saved.id,
            name: saved.name,
            type: saved.type,
            priceCents: saved.priceCents,
            priceUnit: saved.priceUnit,
            count,
          });
        }

        await prisma.creator.update({ where: { id: creator.id }, data: { lastSyncedAt: new Date() } });
        send("done", { total: count });
      } catch (error) {
        console.error("Import stream failed", error);
        send("error", { message: "Import failed — try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
