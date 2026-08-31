@AGENTS.md

# DM

## What DM is

A link-in-bio tool for creators: one page (`dm.to/<handle>`) listing everything a creator
sells, with product catalogs that auto-sync from wherever the creator actually sells —
rather than a creator manually re-entering products DM has no way to keep current.

## Current phase: two ways to become a DM creator

There are now two independent identity paths into DM, and a `Creator` can come from either:

1. **Whop-embedded** — DM runs as an app embedded inside a creator's own Whop dashboard
   (`app/dashboard/[companyId]/`), installed from Whop's App Store. Whop's embedded auth
   (`x-whop-user-token`, see `lib/whop/dashboard-auth.ts`) is the identity system for this
   path. A creator becomes a DM creator by installing the app on Whop — no DM-hosted signup
   involved at all for this path.
2. **Standalone** — real self-serve signup at `/sign-up` (email magic-link or Google, via
   Auth.js/NextAuth — see `lib/auth.ts`), landing in `/app/*` (not `/dashboard/[companyId]`,
   which is Whop-specific naming a standalone creator doesn't have). See
   `lib/standalone-auth.ts`.

Both bridge into the same `Connection`-based identity model (`platform: "whop"` vs.
`platform: "standalone"`, resolved through `lib/connectors/registry.ts`'s
`getCreatorByExternalId` either way) — see `lib/host-context.ts`'s two `HostContext`
implementations, `getWhopEmbeddedHostContext` and `getStandaloneHostContext`. The paths
don't interact: a Whop-embedded creator's `Connection` never touches Auth.js's tables, and
a standalone creator never touches `lib/whop/dashboard-auth.ts`.

**A real, current gap, not a phase-1 limitation:** a standalone creator has no connector, so
there's no way yet to create a *new* custom `Offer` from scratch — `EditorOfferList` and
`/api/offers/[offerId]` only ever reorder/toggle/edit offers that already exist. A
standalone creator's Offers page (`app/app/offers/`) is correctly empty until that's built.

This file used to warn that the marketing landing page's self-serve CTAs had nothing to
hand off to — that's resolved now (`lib/self-serve-signup.ts`'s `SELF_SERVE_SIGNUP_SUPPORTED`
is `true`, and `PrimaryCta`/`Pricing`'s CTAs point at `/sign-up` for real). The general
principle behind that flag is still worth keeping in mind for the *next* thing that isn't
built yet, which is why `lib/host-context.ts` still exists as the place to check.

## The long-term direction

DM's aim is to become a Merge.dev/Plaid-style unified layer across creator platforms —
one normalized product/analytics shape, many source-specific connectors underneath
(Patreon, Shopify, Gumroad, Skool, alongside Whop). That direction is why the connector
and identity layers below exist even though Whop is the only connector implemented today:
adding a second platform should be additive, not a rewrite. Whop is also unusual in being
both a data source *and* a possible embed host — most future connectors will only be the
former.

## Surface map

- **Live**: `app/dashboard/[companyId]/*` (the Whop-embedded dashboard) and `app/app/*` (the
  standalone dashboard) — home, editor, offers, analytics, settings, both routes to the same
  five pages reusing the same presentational components, just resolving identity
  differently. The public `app/[handle]` storefront and `app/page.tsx` (marketing landing
  page, now with real `/sign-up` CTAs) work end to end for both paths.
- **Designed ahead of capability**: nothing at the surface level right now — the standalone
  Offers page is the one still-honest gap (see above), not a whole surface.

## The standing rule

Before implementing a feature, check whether it assumes a capability that may not exist yet
in the current phase or host surface — self-serve signup, a specific platform being
connected, a specific host context (embedded vs. standalone). `lib/host-context.ts` exists
to make that an explicit, checkable fact instead of tribal knowledge. When what's actually
possible right now is unclear, ask rather than assume — this file is meant to reduce how
often that's necessary, not eliminate it.

## Architecture pointers

- `lib/connectors/types.ts` — the `Connector` contract every platform integration must
  satisfy (`connect`, `disconnect`, `getProducts`, optional `getAnalytics`,
  `verifyWebhook`), plus the normalized shapes (`NormalizedProduct`,
  `NormalizedAnalyticsSnapshot`) every connector must return regardless of the platform's
  own API shape. `lib/connectors/registry.ts` is the single platform-name → connector
  lookup point; nothing outside `lib/connectors/` should import a platform SDK directly.
- `lib/host-context.ts` — how DM determines what surface it's currently running in
  (`whop-embedded` or `standalone`) and what that implies is possible
  (`supportsSelfServeSignup`, identity resolution).
- `lib/whop/dashboard-auth.ts`, `webhooks.ts`, `checkout.ts` are deliberately *not* under
  `lib/connectors/whop/` — they're Whop-as-embed-host auth and DM's own Whop-as-payment-
  processor billing (the DM Pro $15/mo plan), not a creator-facing connector. Only the
  catalog-reading pieces (`lib/connectors/whop/`) implement the `Connector` contract.
- `lib/standalone-auth.ts` — the standalone analogue of `lib/whop/dashboard-auth.ts`:
  resolves/creates a `Creator` from an Auth.js session instead of a Whop company. `lib/auth.ts`
  is Auth.js's own config (email magic-link + Google) — a different concern from either
  Whop file above, with its own adapter tables (`User`/`Account`/`Session`/
  `VerificationToken` in `prisma/schema.prisma`) that nothing else in the domain model has a
  foreign key into; the bridge is always a `Connection` row, same as Whop.
