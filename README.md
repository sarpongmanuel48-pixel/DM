# DM

A link-in-bio storefront for Whop creators. DM reads a creator's live products from
their Whop account (memberships, courses, coaching, consulting, free downloads) and
presents them as one polished public page at `dm.to/[handle]`. Visitors tap through to
Whop's own checkout — DM never handles payment itself.

## Stack

Next.js 16 (App Router, Turbopack), Prisma + PostgreSQL (Supabase), Tailwind CSS v4, and
the official `@whop/sdk` behind a single adapter layer (`lib/whop/`).

The dashboard is an embedded Whop app — there's no separate DM login. Whop passes an
`x-whop-user-token` header on every request; `lib/whop/dashboard-auth.ts` verifies it
and checks the user is an admin of the company (`companyId`, from the
`/dashboard/[companyId]` route) before showing anything. The public storefront needs no
auth at all.

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values — see comments in the file
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard only renders inside
Whop's own iframe (it needs a real `x-whop-user-token`) — hitting `/dashboard/[companyId]/*`
directly in a browser will correctly show "Can't verify your Whop session."

## Project structure

- `app/[handle]/` — the public storefront (unauthenticated, card-stack layout)
- `app/dashboard/[companyId]/` — the creator dashboard (embedded in Whop). A company
  with no Creator row yet gets the first-run setup flow instead of the normal chrome —
  see `components/dashboard/FirstRunSetup.tsx`
- `app/api/dashboard/[companyId]/` — company-scoped dashboard mutations (import stream,
  publish, sync, links), each independently admin-verified
- `app/api/whop/webhooks/` — DM's own billing webhook (membership activated/deactivated)
- `lib/whop/` — the Whop adapter (dashboard auth, product/plan sync, checkout, webhooks)
  — the only place that talks to Whop's API directly
- `components/` — UI components, organized by surface (`dashboard/`, `storefront/`,
  `offer-card/`)
- `prisma/` — schema and migrations

See `AGENTS.md` for Next.js version-specific conventions and `DM-build-prompt.md` for
the original product brief.
