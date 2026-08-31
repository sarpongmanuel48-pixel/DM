import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DashboardAuthError } from "@/lib/whop/dashboard-auth";
import { requireAdminForCreatorAnyPlatform } from "@/lib/creator-auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;

  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    await requireAdminForCreatorAnyPlatform(link.creatorId, request.headers);
  } catch (error) {
    if (error instanceof DashboardAuthError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  await prisma.link.delete({ where: { id: linkId } });
  return NextResponse.json({ deleted: true });
}
