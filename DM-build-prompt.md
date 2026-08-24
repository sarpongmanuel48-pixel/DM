# Build prompt: DM

Paste this into Claude Code. Before you do: export the 19 screens from the Claude Design project (PNG or PDF) and attach them alongside this prompt — Claude Code can't open a claude.ai design link directly, it needs the actual images in context.

---

I'm building **DM**, a link-in-bio storefront for Whop creators. It reads a creator's live products from their Whop account (memberships, courses, coaching, consulting, free downloads) and presents them as one polished public page. Visitors tap through to Whop's own checkout — DM never handles payment itself.

I've attached 19 screens from a completed design pass. Treat these as the source of truth for layout, copy, and UX — build to match them, not to your own interpretation of the brief below. Screen IDs referenced below (4A, 2A, 2B, etc.) correspond to the labels in the attached images.

## Stack

Scaffold from Whop's official starter rather than a blank Next.js app:

```
npx create-whop-kit dm
```

(or fork `whopio/whop-saas-starter` directly). This gives you Next.js 16, Prisma + PostgreSQL, Tailwind, and Whop auth/payments already wired for subscriptions. Keep that foundation — don't replace the auth or billing scaffolding.

## Two surfaces — build these as separate route groups from the start

1. **Public storefront** (`dm.to/[handle]`) — a plain, unauthenticated public page. Anyone from Instagram or TikTok's in-app browser can load it. It is NOT gated behind Whop membership or login of any kind.
2. **Creator dashboard** — runs embedded inside a creator's own Whop admin panel (a Whop "Dashboard app"), authenticated automatically via the `x-whop-user-token` header Whop passes in. No separate login screen for this surface.

Don't let these two surfaces share auth logic — they're fundamentally different trust contexts.

## Data model

Keep it minimal:

- **Creator** — id, Whop connection status/tokens, handle, name, tagline, bio, avatar, featured offer id, last synced timestamp
- **Offer** — id, creator id, source (`whop` | `custom`), synced fields from Whop (name, price, billing interval, type: membership/course/coaching/consulting/free), editable fields (custom description, custom thumbnail, visible boolean, sort order), Whop product id, last synced timestamp
- **Link** — id, creator id, label, url, sort order (for non-Whop social/custom links, separate from Offers)
- **ClickEvent** — id, creator id, offer id (nullable), timestamp, referrer

## Whop sync — read-only, and this is the core differentiator

Connect via Whop OAuth (see screen **2A**). The permission scope is explicit and should match the copy on that screen exactly:

**DM will:** read products (names, prices, types, thumbnails), read account name/avatar to prefill the page, check for changes on a schedule.
**DM will never:** create, edit, or delete anything in the creator's Whop account; touch payments or payouts.

Whop doesn't fire a clean webhook for product/price changes, so don't rely on push notifications for catalog freshness. Implement:
- A scheduled poll every 6 hours (see the "next sync in 6h" / "checks every 6h" copy on screens **2D**, **3A**, **4E**) that re-fetches each connected creator's product catalog
- A manual "Re-sync now" action, available from the dashboard (**3A**, **3C**) and on the expired-connection screen (**2E**)
- Read-only fields (name, price, type) must never be editable in the DM UI — enforce this at the API layer, not just in the frontend. Only description, thumbnail, visibility, and sort order are creator-editable (see the "Everything from Whop" table on **3C**).

Wrap every Whop-specific call (OAuth, product fetch, token verification, access checks) behind a single internal adapter/service layer. Don't scatter raw Whop SDK calls through route handlers and components — this is what lets us add a second product source later without a rewrite.

## Onboarding flow (screens 4A → 2D)

Build these five steps in order, matching the attached screens exactly for copy and layout:
1. **4A** — Sign up (Google / Apple / email)
2. **2A** — Connect Whop, with the permission scope callout above
3. **2B** — Auto-import: stream imported products in live with a progress indicator as they arrive, don't just show a spinner and dump the full list at the end
4. **2C** — Choose featured offer + set handle (`dm.to/[handle]`), with live availability check on the handle field
5. **2D** — Confirmation screen with the live link, copy button, and sync status

## Storefront (card stack layout only — screen 1A)

Build to the card-stack direction only. The other two directions from the design pass (bento, editorial ledger) are archived, not needed. Sections, top to bottom:
- Hero: avatar, name, tagline, bio, optional verified badge
- Featured offer: one large Offer Card (see spec below), visually larger than everything else on the page
- Remaining offers: standard-size Offer Cards, grouped/tagged by type
- Custom links: social/other links, secondary weight, below the offers
- Footer: "Made with DM" mark

Also build the loading state (**4B**) and the not-yet-published preview state (**4C** — shows a "Preview only, this page isn't public yet" banner and an empty-offers card with a CTA back to the editor).

## Offer Card component (spec sheet: screen 4F)

One component, two sizes (featured / standard). Fields: thumbnail, type badge, name, one-line description, price (with interval if recurring), CTA button. CTA label maps to type:

- Membership → "Join"
- Course → "Enroll"
- Coaching / Consulting → "Book a call"
- Free → "Get it free"
- Custom link → "Open"

Every CTA except custom links hands off to the corresponding Whop checkout URL. DM never intercepts or processes the transaction.

## Dashboard pages (screens 3A–3E, plus edge states 2E, 4D, 4E)

- **3A Home** — 7-day stats (page visits, offer clicks, CTR), a visits-per-day chart, best-performing offer, sync status with re-sync action
- **3B Editor** — identity fields (photo/name/tagline/bio), drag-to-reorder offer list with visibility toggles and a "make featured" action per row, custom links list, live preview pane alongside the form
- **3C Offers** — full synced table: read-only columns (name, price, type) vs. editable columns (description, visibility), last-synced timestamp per row, manual re-sync
- **3D Analytics** — page views over time, clicks per offer ranked with CTR, traffic source breakdown (and note that in-app browsers often hide the referrer — label accordingly), and a "Handoffs to Whop" counter labeled honestly as taps that reached Whop checkout, not confirmed sales, since DM can't see past that point
- **3E Settings** — page address/handle change, Whop connection management (reconnect/disconnect, with a note that disconnecting freezes prices at last sync rather than breaking the page), custom domain (mark as "coming soon" — not built yet), account, and billing

Edge states to implement, not skip:
- **2E** — expired Whop connection: page stays live showing last-synced data, sync status flips to "Paused," reconnect banner
- **4D** — dashboard first-run state with a "three things worth doing" checklist
- **4E** — Offers page when the creator's Whop account has zero published products yet

## DM's own billing — flat $15/month, no free tier

This is separate from the Whop-sync work above — it's how creators pay for DM itself, using Whop as the payment processor:

- One plan: **DM Pro, $15/month**. No free tier, no offer-count gating, no feature ladder for this pilot.
- Set up a Whop company for DM and configure this as a Whop product/plan; use Whop's checkout for the subscription purchase.
- Listen for `membership.went_valid` / `membership.went_invalid` webhooks to flip a creator's DM access on/off.
- The Settings → Billing panel (**3E**) should show current plan name and price plus a "Manage billing" button that hands off to Whop's own self-service billing portal — don't build subscription management UI yourself.

## Build order

1. Scaffold from the Whop starter
2. Data model + migrations
3. Whop OAuth + read-only product sync (adapter layer, scheduled poll, manual re-sync)
4. Dashboard surface (all 5 pages + edge states)
5. Public storefront surface (card stack + loading/preview states)
6. DM's own subscription billing + webhook handling
7. Deploy to Vercel, install into a real Whop account, and test the full loop end to end before wiring up the Whop App Store listing

Ask me before making any product decision not covered above rather than guessing — especially anything involving what data is read-only vs. editable, or anything touching payments.
