import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminForCreator, DashboardAuthError } from "@/lib/whop/dashboard-auth";

/**
 * Read-only-vs-editable is enforced here, not just in the UI: this schema
 * has no fields for name/price/whopProductId — there is no code path that
 * can accept them, regardless of what a client sends. `type` is the one
 * exception moved into the editable set (see lib/connectors/whop/products.ts's
 * doc comment — Whop has no such field to sync it from in the first place).
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
