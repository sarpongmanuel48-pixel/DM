/*
  Warnings:

  - You are about to drop the column `whopCompanyId` on the `Creator` table.
    Its data is preserved, not lost: this migration first backfills a
    `Connection` row (platform "whop") for every existing Creator using
    that value as `externalId`, then drops the column. See
    lib/connectors/registry.ts for the replacement lookup.

*/
-- AlterEnum
ALTER TYPE "OfferType" ADD VALUE 'OTHER';

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "credentialType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_creatorId_platform_key" ON "Connection"("creatorId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_platform_externalId_key" ON "Connection"("platform", "externalId");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: one "whop" Connection per existing Creator, carrying
-- their whopCompanyId forward as externalId before the column is dropped.
INSERT INTO "Connection" ("id", "creatorId", "platform", "credentialType", "externalId", "status", "lastSyncedAt", "createdAt")
SELECT gen_random_uuid()::text, "id", 'whop', 'app_install', "whopCompanyId", 'connected', "lastSyncedAt", CURRENT_TIMESTAMP
FROM "Creator"
WHERE "whopCompanyId" IS NOT NULL;

-- AlterTable
ALTER TABLE "Creator" DROP CONSTRAINT "Creator_whopCompanyId_key";
ALTER TABLE "Creator" DROP COLUMN "whopCompanyId";
