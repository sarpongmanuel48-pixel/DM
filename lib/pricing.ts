export type OfferType = "MEMBERSHIP" | "COURSE" | "COACHING" | "CONSULTING" | "FREE";
export type PriceUnit = "RECURRING_MONTH" | "ONE_TIME" | "PER_SESSION" | "PROJECT" | "FREE";

export function formatPrice(priceCents: number | null, priceUnit: PriceUnit): string {
  if (priceUnit === "FREE" || priceCents === 0) return "Free";
  if (priceCents == null) return "—";
  const dollars = priceCents / 100;
  const amount = Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
  switch (priceUnit) {
    case "RECURRING_MONTH":
      return `$${amount}/mo`;
    case "PER_SESSION":
      return `$${amount} · per session`;
    case "PROJECT":
      return `$${amount} · project`;
    default:
      return `$${amount}`;
  }
}

// CTA label maps to type — every CTA except custom links hands off to Whop
// checkout (spec sheet 4F).
export function ctaLabelFor(type: OfferType | "CUSTOM"): string {
  switch (type) {
    case "MEMBERSHIP":
      return "Join";
    case "COURSE":
      return "Enroll";
    case "COACHING":
    case "CONSULTING":
      return "Book a call";
    case "FREE":
      return "Get it free";
    default:
      return "Open";
  }
}
