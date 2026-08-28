import { prisma } from "@/lib/prisma";

/**
 * Populates the local-dev-auth-bypass creator (see requireCompanyAdmin in
 * lib/whop/dashboard-auth.ts — companyId "dev-test" only bypasses auth
 * under NODE_ENV=development) with realistic content, so
 * http://localhost:3000/dashboard/dev-test shows a real dashboard instead
 * of every section's empty state. Reuses Jordan Reyes' persona (name,
 * tagline, offers) already established for the landing page's hero photo
 * wall and marquee references elsewhere in this project.
 *
 * Idempotent — safe to re-run. Offers are upserted on their whopProductId,
 * which for these three is a deliberately fake, stable id ("dev-test-…"),
 * not a real Whop product — these rows were never synced from Whop.
 */
async function main() {
  const creator = await prisma.creator.upsert({
    where: { handle: "jordanreyes" },
    create: {
      handle: "jordanreyes",
      name: "Jordan Reyes",
      tagline: "Trading Educator",
      bio: "Helping new traders read the market without the guesswork. Real trades, no hype — start with the free guide below.",
      avatarUrl: "/personas/jordan-reyes.jpg",
      publishedAt: new Date(),
    },
    update: {
      name: "Jordan Reyes",
      tagline: "Trading Educator",
      bio: "Helping new traders read the market without the guesswork. Real trades, no hype — start with the free guide below.",
      avatarUrl: "/personas/jordan-reyes.jpg",
      publishedAt: new Date(),
    },
  });

  await prisma.connection.upsert({
    where: { platform_externalId: { platform: "whop", externalId: "dev-test" } },
    create: {
      creatorId: creator.id,
      platform: "whop",
      credentialType: "app_install",
      externalId: "dev-test",
      status: "connected",
    },
    update: { creatorId: creator.id, status: "connected" },
  });

  const masterclass = await prisma.offer.upsert({
    where: { creatorId_whopProductId: { creatorId: creator.id, whopProductId: "dev-test-masterclass" } },
    create: {
      creatorId: creator.id,
      source: "CUSTOM",
      whopProductId: "dev-test-masterclass",
      type: "COURSE",
      name: "Trading Masterclass",
      description: "Learn the fundamentals",
      priceCents: 4900,
      priceUnit: "ONE_TIME",
      sortOrder: 0,
    },
    update: {},
  });

  await prisma.offer.upsert({
    where: { creatorId_whopProductId: { creatorId: creator.id, whopProductId: "dev-test-community" } },
    create: {
      creatorId: creator.id,
      source: "CUSTOM",
      whopProductId: "dev-test-community",
      type: "MEMBERSHIP",
      name: "Private Trading Community",
      description: "Daily setups, live Q&A, and trade reviews.",
      priceCents: 2000,
      priceUnit: "RECURRING_MONTH",
      sortOrder: 1,
    },
    update: {},
  });

  await prisma.offer.upsert({
    where: { creatorId_whopProductId: { creatorId: creator.id, whopProductId: "dev-test-guide" } },
    create: {
      creatorId: creator.id,
      source: "CUSTOM",
      whopProductId: "dev-test-guide",
      type: "FREE",
      name: "Free Trading Guide",
      description: "Start here before anything else.",
      priceCents: 0,
      priceUnit: "FREE",
      sortOrder: 2,
    },
    update: {},
  });

  await prisma.creator.update({ where: { id: creator.id }, data: { featuredOfferId: masterclass.id } });

  console.log(`Seeded dev-test dashboard: creator ${creator.id} (dm.to/${creator.handle})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
