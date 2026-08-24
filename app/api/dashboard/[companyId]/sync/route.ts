import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAdmin, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { prisma } from "@/lib/prisma";
import { syncCreator } from "@/lib/whop/sync";

/** Manual "Re-sync now" — dashboard Home/Offers (3A/3C). */
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

  const result = await syncCreator(creator.id);
  return NextResponse.json(result);
}
