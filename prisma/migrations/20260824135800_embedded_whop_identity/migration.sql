-- Drop Auth.js identity tables (User/Account/Session/VerificationToken)
-- and rekey Creator to the Whop company that installed the app, per the
-- brief's actual spec: the dashboard is an embedded Whop app authenticated
-- via x-whop-user-token, not a separate DM login.

ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";
ALTER TABLE "Creator" DROP CONSTRAINT "Creator_userId_fkey";

DROP TABLE "Session";
DROP TABLE "Account";
DROP TABLE "User";
DROP TABLE "VerificationToken";

ALTER TABLE "Creator" DROP COLUMN "userId";
ALTER TABLE "Creator" DROP COLUMN "whopConnectionStatus";
ALTER TABLE "Creator" DROP COLUMN "whopAccessToken";
ALTER TABLE "Creator" DROP COLUMN "whopRefreshToken";
ALTER TABLE "Creator" DROP COLUMN "whopTokenExpiresAt";

ALTER TABLE "Creator" ALTER COLUMN "whopCompanyId" SET NOT NULL;
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_whopCompanyId_key" UNIQUE ("whopCompanyId");

CREATE INDEX "Creator_dmSubscriptionStatus_idx" ON "Creator"("dmSubscriptionStatus");

DROP TYPE "WhopConnectionStatus";
