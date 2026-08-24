import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForCreator, DashboardAuthError } from "@/lib/whop/dashboard-auth";

/** "Make featured" (3B row action) — sets the one Offer Card rendered
 * large at the top of the storefront. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    await requireAdminForCreator(offer.creatorId, request.headers);
  } catch (error) {
    if (error instanceof DashboardAuthError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  await prisma.creator.update({
    where: { id: offer.creatorId },
    data: { featuredOfferId: offerId },
  });

  return NextResponse.json({ featuredOfferId: offerId });
}
