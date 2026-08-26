import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAdmin, getCreatorByCompanyId, DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { syncCreator } from "@/lib/connectors/sync";

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

  const creator = await getCreatorByCompanyId(companyId);
  if (!creator) {
    return NextResponse.json({ error: "no creator for this company" }, { status: 404 });
  }

  const result = await syncCreator(creator.id);
  return NextResponse.json(result);
}
