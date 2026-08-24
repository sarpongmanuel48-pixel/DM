import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { revokeToken } from "@/lib/whop/oauth";

/** Settings → Whop connection → Disconnect (3E). The page stays live on
 * whatever was last synced — prices freeze, they don't disappear. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this account" }, { status: 404 });
  }

  if (creator.whopRefreshToken) {
    await revokeToken(decryptToken(creator.whopRefreshToken)).catch(() => {});
  }

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      whopConnectionStatus: "DISCONNECTED",
      whopAccessToken: null,
      whopRefreshToken: null,
      whopTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ disconnected: true });
}
