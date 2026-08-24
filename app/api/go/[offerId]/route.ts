import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SOURCE_PATTERNS: Array<[RegExp, "INSTAGRAM" | "TIKTOK" | "YOUTUBE"]> = [
  [/instagram/i, "INSTAGRAM"],
  [/tiktok/i, "TIKTOK"],
  [/youtube/i, "YOUTUBE"],
];

function bucketReferrer(referrer: string | null): "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "DIRECT" | "OTHER" {
  if (!referrer) return "DIRECT"; // in-app browsers usually hide it — 3D's own caveat
  const match = SOURCE_PATTERNS.find(([pattern]) => pattern.test(referrer));
  if (match) return match[1];
  return "OTHER";
}

/** Every Offer Card CTA (except custom links) points here first — logs the
 * click, then hands off to the offer's real Whop checkout URL. DM never
 * intercepts the transaction itself, only counts that the handoff happened
 * (3D's "Handoffs to Whop", explicitly not a sales count). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { id: true, creatorId: true, whopCheckoutUrl: true, visible: true },
  });

  if (!offer || !offer.visible || !offer.whopCheckoutUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const referrer = request.headers.get("referer");
  await prisma.clickEvent.create({
    data: {
      creatorId: offer.creatorId,
      offerId: offer.id,
      referrer,
      sourceBucket: bucketReferrer(referrer),
    },
  });

  return NextResponse.redirect(offer.whopCheckoutUrl);
}
