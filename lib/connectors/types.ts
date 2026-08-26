/**
 * The contract every platform integration must satisfy. Nothing outside
 * `lib/connectors/` should import a platform SDK (`@whop/sdk`, a future
 * `@patreon/sdk`, etc.) directly — every call goes through `registry.ts`.
 * `getProducts` returning `NormalizedProduct[]` is what forces a new
 * connector to normalize its data instead of leaking a platform-specific
 * shape into DM's own domain model.
 */

/** Aligned with the Prisma `OfferType` enum (see prisma/schema.prisma) —
 * "other" is what a connector reports when it can't classify a product
 * into any of the more specific buckets. */
export type NormalizedProductType = "membership" | "course" | "coaching" | "consulting" | "free" | "other";

export type NormalizedBillingInterval = "one_time" | "monthly" | "per_session" | null;

export interface NormalizedProduct {
  id: string;
  connectionId: string;
  name: string;
  description: string | null;
  /** Integer cents — matches `Offer.priceCents` exactly. A connector is
   * responsible for converting its platform's native price units (e.g.
   * Whop's decimal currency, 20.00) into cents itself. */
  price: number | null;
  currency: string | null;
  billingInterval: NormalizedBillingInterval;
  type: NormalizedProductType;
  thumbnailUrl: string | null;
  checkoutUrl: string;
  status: "active" | "unavailable";
}

export interface NormalizedAnalyticsSnapshot {
  connectionId: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: Record<string, number>; // platform-specific metrics stay in here, not as top-level fields
}

export interface Connector {
  platform: string;
  connect(params: unknown): Promise<{ connectionId: string }>;
  disconnect(connectionId: string): Promise<void>;
  getProducts(connectionId: string): Promise<NormalizedProduct[]>;
  getAnalytics?(connectionId: string): Promise<NormalizedAnalyticsSnapshot>; // optional -- not every platform will support this at first
  verifyWebhook(request: Request): Promise<boolean>;
}
