import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Read-only-vs-editable is enforced here, not just in the UI: this schema
 * has no fields for name/price/whopProductId — there is no code path that
 * can accept them, regardless of what a client sends. `type` is the one
 * exception moved into the editable set (see lib/whop/products.ts's doc
 * comment — Whop has no such field to sync it from in the first place).
 */
const patchSchema = z
  .object({
    description: z.string().max(280).nullable(),
    thumbnailUrl: z.string().url().nullable(),
    visible: z.boolean(),
    sortOrder: z.number().int(),
    type: z.enum(["MEMBERSHIP", "COURSE", "COACHING", "CONSULTING", "FREE"]),
  })
  .partial();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
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

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
