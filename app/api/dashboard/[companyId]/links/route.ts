import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCompanyAdmin, DashboardAuthError } from "@/lib/whop/dashboard-auth";

const createSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url(),
});

/** Custom links editor (3B) — social/other links, separate from Offers. */
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

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.link.count({ where: { creatorId: creator.id } });
  const link = await prisma.link.create({
    data: { creatorId: creator.id, label: parsed.data.label, url: parsed.data.url, sortOrder: count },
  });

  return NextResponse.json(link, { status: 201 });
}
