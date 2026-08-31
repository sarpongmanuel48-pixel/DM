import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreatorForApi, StandaloneAuthError } from "@/lib/standalone-auth";

const createSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url(),
});

/** Standalone analogue of app/api/dashboard/[companyId]/links/route.ts —
 * same create-a-custom-link behavior, session-based auth instead of a
 * companyId route param. */
export async function POST(request: NextRequest) {
  let creator;
  try {
    creator = await requireCreatorForApi();
  } catch (error) {
    if (error instanceof StandaloneAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
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
