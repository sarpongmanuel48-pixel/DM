import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAllConnectedCreators, syncCreator } from "@/lib/whop/sync";

/** Vercel Cron hits this every 6h (see vercel.json) to refresh every
 * connected creator's catalog — the "checks every 6h" copy on 2D/3A/4E. */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await syncAllConnectedCreators();
  return NextResponse.json({ results });
}

/** Manual "Re-sync now" — dashboard Home/Offers (3A/3C) and the expired-
 * connection screen (2E). Syncs only the signed-in creator's own catalog. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this account" }, { status: 404 });
  }

  const result = await syncCreator(creator.id);
  return NextResponse.json(result);
}
