import { NextRequest, NextResponse } from "next/server";
import { handleWhopWebhook, WebhookVerificationError } from "@/lib/whop/webhooks";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  try {
    await handleWhopWebhook(rawBody, headers);
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
    console.error("Whop webhook handling failed", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
