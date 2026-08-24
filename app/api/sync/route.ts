import { NextRequest, NextResponse } from "next/server";
import { syncAllCreators } from "@/lib/whop/sync";

/** Vercel Cron hits this every 6h (see vercel.json) to refresh every
 * creator's catalog — the "checks every 6h" copy on 3A/4E. */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await syncAllCreators();
  return NextResponse.json({ results });
}
