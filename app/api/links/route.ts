import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url(),
});

/** Custom links editor (3B) — social/other links, separate from Offers. */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) {
    return NextResponse.json({ error: "no creator for this account" }, { status: 404 });
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
