import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyAdmin, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { prisma } from "@/lib/prisma";
import { isReservedHandle, isValidHandleFormat } from "@/lib/reserved-handles";

const publishSchema = z.object({
  handle: z.string(),
  featuredOfferId: z.string().nullable(),
});

/** First-run setup's final step (2C/2D folded together) — claims the
 * handle and publishes the page. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
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

  const parsed = publishSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const handle = parsed.data.handle.toLowerCase();
  if (!isValidHandleFormat(handle) || isReservedHandle(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  const handleTaken = await prisma.creator.findFirst({
    where: { handle, id: { not: creator.id } },
  });
  if (handleTaken) {
    return NextResponse.json({ error: "handle taken" }, { status: 409 });
  }

  if (parsed.data.featuredOfferId) {
    const offer = await prisma.offer.findUnique({ where: { id: parsed.data.featuredOfferId } });
    if (!offer || offer.creatorId !== creator.id) {
      return NextResponse.json({ error: "invalid featured offer" }, { status: 400 });
    }
  }

  const updated = await prisma.creator.update({
    where: { id: creator.id },
    data: { handle, featuredOfferId: parsed.data.featuredOfferId, publishedAt: new Date() },
  });

  return NextResponse.json({ handle: updated.handle });
}
