import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** "Make featured" (3B row action / 2C onboarding pick) — sets the one
 * Offer Card rendered large at the top of the storefront. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { offerId } = await params;
  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this account" }, { status: 404 });
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.creatorId !== creator.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.creator.update({
    where: { id: creator.id },
    data: { featuredOfferId: offerId },
  });

  return NextResponse.json({ featuredOfferId: offerId });
}
