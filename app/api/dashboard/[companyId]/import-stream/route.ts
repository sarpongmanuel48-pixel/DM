import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAdmin, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { prisma } from "@/lib/prisma";
import { whopClientForCompany } from "@/lib/whop/client";
import { fetchAccountProfile, streamOffers } from "@/lib/whop/products";

/**
 * Backs the dashboard's first-run import — Server-Sent Events so the setup
 * screen can render each product landing one at a time instead of a
 * spinner that dumps the whole list at the end. Requires the requesting
 * user to be a verified admin on `companyId`; Whop's embedding proxy
 * attaches x-whop-user-token to requests made from inside the iframe, so
 * this works from a plain client-side EventSource with no extra plumbing.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;

  try {
    await requireCompanyAdmin(companyId, request.headers);
  } catch (error) {
    if (error instanceof DashboardAuthError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  const creator = await prisma.creator.findUnique({ where: { whopCompanyId: companyId } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this company" }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const client = whopClientForCompany();

        const profile = await fetchAccountProfile(client, companyId);
        await prisma.creator.update({
          where: { id: creator.id },
          data: { verified: profile.verified },
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

        await prisma.creator.update({
          where: { id: creator.id },
          data: { lastSyncedAt: new Date(), name: creator.name || profile.name, avatarUrl: creator.avatarUrl ?? profile.avatarUrl },
        });
        send("done", { total: count });
      } catch (error) {
        console.error("Dashboard import stream failed", error);
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
