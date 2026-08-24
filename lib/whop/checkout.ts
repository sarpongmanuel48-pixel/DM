import { whopClientForDm } from "@/lib/whop/client";

/** DM Pro's checkout link — the $15/mo plan on DM's own Whop company.
 * Every offer's own checkout link is just `Offer.whopCheckoutUrl`
 * (Whop's `Plan.purchase_url`, captured at sync time); this is the one
 * checkout DM builds itself, for its own subscription. */
export async function getDmProCheckoutUrl(): Promise<string> {
  const planId = process.env.WHOP_DM_PRO_PLAN_ID;
  if (!planId) throw new Error("WHOP_DM_PRO_PLAN_ID is not set");
  const client = whopClientForDm();
  const plan = await client.plans.retrieve({ id: planId });
  return plan.purchase_url;
}
