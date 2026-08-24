import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isReservedHandle, isValidHandleFormat } from "@/lib/reserved-handles";

/** Backs the live availability check on the handle field (2C). */
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.toLowerCase() ?? "";

  if (!isValidHandleFormat(handle)) {
    return NextResponse.json({ available: false, reason: "invalid_format" });
  }
  if (isReservedHandle(handle)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const existing = await prisma.creator.findUnique({ where: { handle } });
  return NextResponse.json({ available: !existing });
}
