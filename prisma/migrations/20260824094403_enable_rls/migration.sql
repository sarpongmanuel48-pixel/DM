-- Deny-by-default RLS on every table. This app never connects through
-- Supabase's PostgREST layer (no supabase-js, no anon key client-side) —
-- Prisma always connects as the `postgres` role, which owns these tables
-- and bypasses RLS regardless of policies. Enabling RLS here with zero
-- policies costs the app nothing; it just closes the auto-exposed public
-- REST API as a safety net, since Supabase generates one for every
-- project whether or not it's used.

-- _prisma_migrations is excluded: it's Prisma's own bookkeeping table,
-- created outside migration files, so referencing it here breaks the
-- shadow-database dry run `prisma migrate dev` uses to validate migrations.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Creator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClickEvent" ENABLE ROW LEVEL SECURITY;
