@AGENTS.md

# DM

## What DM is

A link-in-bio tool for creators: one page (`dm.to/<handle>`) listing everything a creator
sells, with product catalogs that auto-sync from wherever the creator actually sells —
rather than a creator manually re-entering products DM has no way to keep current.

## Current phase: Whop-only, embedded, no self-serve signup

DM runs today as an app embedded inside a creator's own Whop dashboard
(`app/dashboard/[companyId]/`), installed from Whop's App Store. Whop's embedded auth
(`x-whop-user-token`, see `lib/whop/dashboard-auth.ts`) *is* DM's identity system for this
phase — **there is no DM-hosted account creation, login, or self-serve signup.** A creator
becomes a DM creator by installing the app on Whop; nothing in the product creates a
`Creator` any other way right now.

This matters because it's exactly the assumption that broke once already: the marketing
landing page (`app/page.tsx`, `components/landing/`) shipped with CTAs built for a
self-serve claim-a-handle flow that doesn't exist in this phase. Its CTAs are gated behind
`lib/host-context.ts`'s `supportsSelfServeSignup` flag for this reason — see that file
before assuming the page's buttons do what they look like they do.

## The long-term direction

DM's aim is to become a Merge.dev/Plaid-style unified layer across creator platforms —
one normalized product/analytics shape, many source-specific connectors underneath
(Patreon, Shopify, Gumroad, Skool, alongside Whop). That direction is why the connector
and identity layers below exist even though Whop is the only connector implemented today:
adding a second platform should be additive, not a rewrite. Whop is also unusual in being
both a data source *and* a possible embed host — most future connectors will only be the
former.

## Surface map

- **Live**: `app/dashboard/[companyId]/*` (the embedded dashboard — home, editor, offers,
  analytics, settings) and the public `app/[handle]` storefront. Both work end to end today.
- **Designed ahead of capability**: `app/page.tsx` (marketing landing page). It exists and
  renders, but every CTA that would need self-serve signup is gated off in this phase — see
  `lib/host-context.ts`. That's expected, not a bug to fix by inventing a signup flow.

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
  (`whop-embedded` today) and what that implies is possible (`supportsSelfServeSignup`,
  identity resolution).
- `lib/whop/dashboard-auth.ts`, `webhooks.ts`, `checkout.ts` are deliberately *not* under
  `lib/connectors/whop/` — they're Whop-as-embed-host auth and DM's own Whop-as-payment-
  processor billing (the DM Pro $15/mo plan), not a creator-facing connector. Only the
  catalog-reading pieces (`lib/connectors/whop/`) implement the `Connector` contract.
