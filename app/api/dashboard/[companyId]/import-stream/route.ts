import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAdmin, getCreatorByCompanyId, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { prisma } from "@/lib/prisma";
import { OFFER_SOURCE, upsertOffer } from "@/lib/connectors/sync";
import { whopClientForCompany } from "@/lib/connectors/whop/client";
import { fetchAccountProfile, streamProducts } from "@/lib/connectors/whop/products";

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

  const creator = await getCreatorByCompanyId(companyId);
  if (!creator) {
    return NextResponse.json({ error: "no creator for this company" }, { status: 404 });
  }
  const connection = await prisma.connection.findUniqueOrThrow({
    where: { creatorId_platform: { creatorId: creator.id, platform: "whop" } },
  });

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
        for await (const product of streamProducts(client, companyId, connection.id)) {
          const saved = await upsertOffer(creator.id, OFFER_SOURCE.whop, product, count);

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
