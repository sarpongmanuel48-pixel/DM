import type { WhopClient } from "@whop/sdk";

/**
 * Whop's Product/Plan API has no membership/course/coaching/consulting/free
 * taxonomy — a Product is just a title/description with Plans for pricing.
 * `type` is DM's own best-effort classification, assigned once at import
 * from the signals Whop actually exposes, then handed to the creator to
 * correct — see the Offers screen (3C). It is NOT re-synced afterward.
 */
export type DetectedOfferType = "MEMBERSHIP" | "COURSE" | "COACHING" | "CONSULTING" | "FREE";
export type DetectedPriceUnit = "RECURRING_MONTH" | "ONE_TIME" | "PER_SESSION" | "PROJECT" | "FREE";

export interface FetchedOffer {
  whopProductId: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  whopCheckoutUrl: string;
  priceCents: number | null;
  type: DetectedOfferType;
  priceUnit: DetectedPriceUnit;
}

export interface FetchedAccountProfile {
  whopCompanyId: string;
  name: string;
  avatarUrl: string | null;
  verified: boolean;
}

async function firstFromPage<T>(page: AsyncIterable<T>): Promise<T | undefined> {
  for await (const item of page) return item;
  return undefined;
}

export async function fetchAccountProfile(
  client: WhopClient,
  companyId: string,
): Promise<FetchedAccountProfile> {
  const company = await client.companies.retrieve({ id: companyId });
  return {
    whopCompanyId: company.id,
    name: company.title,
    avatarUrl: company.logo?.url ?? null,
    verified: company.verified,
  };
}

/** Fetches every visible product + its primary plan, mapped to DM's Offer shape. */
export async function fetchOffers(client: WhopClient, companyId: string): Promise<FetchedOffer[]> {
  const offers: FetchedOffer[] = [];
  for await (const offer of streamOffers(client, companyId)) offers.push(offer);
  return offers;
}

/**
 * Same as fetchOffers, but yields each offer as soon as it's mapped — used
 * by the onboarding import stream (2B) so the page can render products
 * landing one by one instead of a spinner that dumps the full list at once.
 */
export async function* streamOffers(client: WhopClient, companyId: string): AsyncGenerator<FetchedOffer> {
  const products = await client.products.list({
    account_id: companyId,
    visibilities: ["visible"],
  });

  for await (const product of products) {
    const plans = await client.plans.list({
      account_id: companyId,
      product_ids: [product.id],
      visibilities: ["visible"],
      release_methods: ["buy_now"],
    });
    const plan = await firstFromPage(plans);
    if (!plan) continue; // nothing purchasable yet — skip until the creator adds a plan

    const type = await detectOfferType(client, companyId, product, plan);
    yield {
      whopProductId: product.id,
      name: product.title,
      // Prefill only — creator-owned after the first import, never overwritten by later syncs.
      description: product.headline,
      thumbnailUrl: product.gallery_images[0]?.url ?? null,
      whopCheckoutUrl: plan.purchase_url,
      priceCents: priceCentsFor(plan, type),
      type,
      priceUnit: priceUnitFor(plan, type),
    };
  }
}

function priceCentsFor(plan: { renewal_price: number; initial_price: number }, type: DetectedOfferType): number | null {
  if (type === "FREE") return 0;
  // Whop's plan prices are decimal currency units (e.g. 20.00), not cents —
  // verify against a real connected account before shipping.
  const amount = plan.renewal_price > 0 ? plan.renewal_price : plan.initial_price;
  return Math.round(amount * 100);
}

function priceUnitFor(plan: { plan_type: string }, type: DetectedOfferType): DetectedPriceUnit {
  if (type === "FREE") return "FREE";
  if (plan.plan_type === "renewal") return "RECURRING_MONTH";
  if (type === "COACHING") return "PER_SESSION";
  if (type === "CONSULTING") return "PROJECT";
  return "ONE_TIME";
}

async function detectOfferType(
  client: WhopClient,
  companyId: string,
  product: { id: string; title: string; headline: string | null },
  plan: { renewal_price: number; initial_price: number; plan_type: string },
): Promise<DetectedOfferType> {
  if (plan.renewal_price === 0 && plan.initial_price === 0) return "FREE";
  if (plan.plan_type === "renewal") return "MEMBERSHIP";

  // One-time plan: a Course experience attached to the product is the
  // strongest signal available. Anything else falls back to a keyword
  // match on the product's own copy, then defaults to Coaching.
  try {
    const experiences = await client.experiences.list({ company_id: companyId, product_id: product.id });
    for await (const experience of experiences) {
      if (/course/i.test(experience.app.name)) return "COURSE";
    }
  } catch {
    // Non-fatal — fall through to the keyword heuristic below.
  }

  const text = `${product.title} ${product.headline ?? ""}`.toLowerCase();
  if (/consult/.test(text)) return "CONSULTING";
  if (/coach|session|1:1|1-on-1/.test(text)) return "COACHING";
  return "COACHING";
}
