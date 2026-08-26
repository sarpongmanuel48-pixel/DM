import type { WhopClient } from "@whop/sdk";
import type { NormalizedBillingInterval, NormalizedProduct, NormalizedProductType } from "@/lib/connectors/types";

/**
 * Whop's Product/Plan API has no membership/course/coaching/consulting/free
 * taxonomy — a Product is just a title/description with Plans for pricing.
 * `type` is DM's own best-effort classification, assigned once at import
 * from the signals Whop actually exposes, then handed to the creator to
 * correct — see the Offers screen (3C). It is NOT re-synced afterward.
 */
type DetectedOfferType = "MEMBERSHIP" | "COURSE" | "COACHING" | "CONSULTING" | "FREE";

const TYPE_TO_NORMALIZED: Record<DetectedOfferType, NormalizedProductType> = {
  MEMBERSHIP: "membership",
  COURSE: "course",
  COACHING: "coaching",
  CONSULTING: "consulting",
  FREE: "free",
};

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

/** Fetches every visible product + its primary plan, normalized to the
 * Connector contract's shape. `connectionId` is stamped onto each result —
 * callers get it from the creator's `Connection` row (see
 * `lib/connectors/registry.ts`). */
export async function fetchProducts(
  client: WhopClient,
  companyId: string,
  connectionId: string,
): Promise<NormalizedProduct[]> {
  const products: NormalizedProduct[] = [];
  for await (const product of streamProducts(client, companyId, connectionId)) products.push(product);
  return products;
}

/**
 * Same as fetchProducts, but yields each product as soon as it's mapped —
 * used by the onboarding import stream (2B) so the page can render
 * products landing one by one instead of a spinner that dumps the full
 * list at once.
 */
export async function* streamProducts(
  client: WhopClient,
  companyId: string,
  connectionId: string,
): AsyncGenerator<NormalizedProduct> {
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
      id: product.id,
      connectionId,
      name: product.title,
      // Prefill only — creator-owned after the first import, never overwritten by later syncs.
      description: product.headline,
      thumbnailUrl: product.gallery_images[0]?.url ?? null,
      checkoutUrl: plan.purchase_url,
      price: priceCentsFor(plan, type),
      currency: null, // Whop's plan API doesn't expose a currency code today — revisit if that changes.
      billingInterval: billingIntervalFor(plan, type),
      type: TYPE_TO_NORMALIZED[type],
      status: "active",
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

function billingIntervalFor(plan: { plan_type: string }, type: DetectedOfferType): NormalizedBillingInterval {
  if (type === "FREE") return null;
  if (plan.plan_type === "renewal") return "monthly";
  if (type === "COACHING") return "per_session";
  return "one_time";
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
