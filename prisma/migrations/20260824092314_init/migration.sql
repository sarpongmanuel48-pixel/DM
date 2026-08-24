-- CreateEnum
CREATE TYPE "WhopConnectionStatus" AS ENUM ('CONNECTED', 'EXPIRED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "DmSubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OfferSource" AS ENUM ('WHOP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('MEMBERSHIP', 'COURSE', 'COACHING', 'CONSULTING', 'FREE');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('RECURRING_MONTH', 'ONE_TIME', 'PER_SESSION', 'PROJECT', 'FREE');

-- CreateEnum
CREATE TYPE "ClickSourceBucket" AS ENUM ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'DIRECT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featuredOfferId" TEXT,
    "whopConnectionStatus" "WhopConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "whopCompanyId" TEXT,
    "whopUserId" TEXT,
    "whopAccessToken" TEXT,
    "whopRefreshToken" TEXT,
    "whopTokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "dmSubscriptionStatus" "DmSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "dmWhopMembershipId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "source" "OfferSource" NOT NULL DEFAULT 'WHOP',
    "whopProductId" TEXT,
    "type" "OfferType" NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER,
    "priceUnit" "PriceUnit" NOT NULL,
    "whopCheckoutUrl" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "offerId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT,
    "sourceBucket" "ClickSourceBucket" NOT NULL DEFAULT 'DIRECT',

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_handle_key" ON "Creator"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_featuredOfferId_key" ON "Creator"("featuredOfferId");

-- CreateIndex
CREATE INDEX "Creator_whopConnectionStatus_idx" ON "Creator"("whopConnectionStatus");

-- CreateIndex
CREATE INDEX "Offer_creatorId_idx" ON "Offer"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_creatorId_whopProductId_key" ON "Offer"("creatorId", "whopProductId");

-- CreateIndex
CREATE INDEX "Link_creatorId_idx" ON "Link"("creatorId");

-- CreateIndex
CREATE INDEX "ClickEvent_creatorId_timestamp_idx" ON "ClickEvent"("creatorId", "timestamp");

-- CreateIndex
CREATE INDEX "ClickEvent_offerId_idx" ON "ClickEvent"("offerId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_featuredOfferId_fkey" FOREIGN KEY ("featuredOfferId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
