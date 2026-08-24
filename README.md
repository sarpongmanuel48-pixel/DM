# DM

A link-in-bio storefront for Whop creators. DM reads a creator's live products from
their Whop account (memberships, courses, coaching, consulting, free downloads) and
presents them as one polished public page at `dm.to/[handle]`. Visitors tap through to
Whop's own checkout — DM never handles payment itself.

## Stack

Next.js 16 (App Router, Turbopack), Prisma + PostgreSQL (Supabase), Tailwind CSS v4,
Auth.js v5 (dashboard identity), and the official `@whop/sdk` behind a single adapter
layer (`lib/whop/`) for the read-only Whop connection.

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values — see comments in the file
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/[handle]/` — the public storefront (unauthenticated, card-stack layout)
- `app/(auth)/`, `app/onboarding/` — sign-up and the Whop-connect → import → claim-handle flow
- `app/dashboard/` — the creator dashboard (embedded in Whop, authenticated)
- `app/api/whop/` — the OAuth connect flow, webhooks, and streaming import
- `lib/whop/` — the Whop adapter (OAuth, product/plan sync, checkout, webhooks) — the
  only place that talks to Whop's API directly
- `components/` — UI components, organized by surface (`dashboard/`, `storefront/`,
  `offer-card/`, `onboarding/`)
- `prisma/` — schema and migrations

See `AGENTS.md` for Next.js version-specific conventions and `DM-build-prompt.md` for
the original product brief.
