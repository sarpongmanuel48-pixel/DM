import { unwrapWebhook, WebhookVerificationError } from "@whop/sdk/helpers";
import { prisma } from "@/lib/prisma";

/**
 * DM's own billing webhook — fired by Whop when someone's membership to the
 * DM Pro plan (on DM's own company) changes. Real event names confirmed
 * against @whop/sdk's WebhookEvent enum: `membership.activated` /
 * `membership.deactivated` (the brief said "went_valid/went_invalid", which
 * isn't what Whop actually sends).
 *
 * Correlation limitation: the payload carries `user_id`, not a DM-chosen
 * identifier, so it's matched against Creator.whopUserId — the account that
 * creator used for their own "Connect Whop" step. A creator who pays for DM
 * Pro with a *different* Whop account than the one they connected won't
 * auto-match; acceptable for the pilot.
 */

interface MembershipWebhookPayload {
  type: string;
  data: {
    id: string;
    plan_id: string;
    user_id: string | null;
    status: string;
  };
}

export async function handleWhopWebhook(rawBody: string, headers: Record<string, string>): Promise<void> {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const event = unwrapWebhook<MembershipWebhookPayload>(rawBody, { headers, key: secret });

  if (event.type !== "membership.activated" && event.type !== "membership.deactivated") {
    return; // not a membership event this endpoint cares about
  }

  const { plan_id, user_id } = event.data;
  const dmProPlanId = process.env.WHOP_DM_PRO_PLAN_ID;
  if (!user_id || plan_id !== dmProPlanId) return;

  const creator = await prisma.creator.findFirst({ where: { whopUserId: user_id } });
  if (!creator) return; // no matching DM account for this Whop user yet

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      dmSubscriptionStatus: event.type === "membership.activated" ? "ACTIVE" : "INACTIVE",
      dmWhopMembershipId: event.data.id,
    },
  });
}

export { WebhookVerificationError };
