import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { linkId } = await params;
  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this account" }, { status: 404 });
  }

  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link || link.creatorId !== creator.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { id: linkId } });
  return NextResponse.json({ deleted: true });
}
