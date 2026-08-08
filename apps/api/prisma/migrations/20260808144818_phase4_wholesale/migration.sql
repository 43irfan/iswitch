-- CreateEnum
CREATE TYPE "BillingMode" AS ENUM ('PREPAID', 'POSTPAID');

-- CreateEnum
CREATE TYPE "TrunkAuthType" AS ENUM ('USERPASS', 'IP_ACL', 'BOTH');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "balanceMicros" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "billingMode" "BillingMode" NOT NULL DEFAULT 'PREPAID',
ADD COLUMN     "creditLimitMicros" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "maxChannels" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxCps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "techPrefix" TEXT;

-- CreateTable
CREATE TABLE "CustomerTrunk" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authType" "TrunkAuthType" NOT NULL DEFAULT 'USERPASS',
    "sipUsername" TEXT,
    "sipPassword" TEXT,
    "ipAcl" TEXT,
    "techPrefix" TEXT,
    "maxChannels" INTEGER NOT NULL DEFAULT 10,
    "maxCps" INTEGER NOT NULL DEFAULT 5,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerTrunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierTrunk" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 5060,
    "sipUsername" TEXT,
    "sipPassword" TEXT,
    "codecs" TEXT NOT NULL DEFAULT 'ulaw,alaw',
    "maxChannels" INTEGER NOT NULL DEFAULT 100,
    "maxCps" INTEGER NOT NULL DEFAULT 50,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierTrunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePrefix" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "description" TEXT,
    "carrierTrunkId" TEXT NOT NULL,
    "rateMicros" BIGINT NOT NULL DEFAULT 0,
    "costMicros" BIGINT NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePrefix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerTrunk_accountId_idx" ON "CustomerTrunk"("accountId");

-- CreateIndex
CREATE INDEX "CustomerTrunk_sipUsername_idx" ON "CustomerTrunk"("sipUsername");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerTrunk_accountId_name_key" ON "CustomerTrunk"("accountId", "name");

-- CreateIndex
CREATE INDEX "CarrierTrunk_accountId_idx" ON "CarrierTrunk"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierTrunk_accountId_name_key" ON "CarrierTrunk"("accountId", "name");

-- CreateIndex
CREATE INDEX "RoutePrefix_accountId_prefix_idx" ON "RoutePrefix"("accountId", "prefix");

-- CreateIndex
CREATE INDEX "RoutePrefix_carrierTrunkId_idx" ON "RoutePrefix"("carrierTrunkId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutePrefix_accountId_prefix_carrierTrunkId_key" ON "RoutePrefix"("accountId", "prefix", "carrierTrunkId");

-- AddForeignKey
ALTER TABLE "CustomerTrunk" ADD CONSTRAINT "CustomerTrunk_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierTrunk" ADD CONSTRAINT "CarrierTrunk_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePrefix" ADD CONSTRAINT "RoutePrefix_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePrefix" ADD CONSTRAINT "RoutePrefix_carrierTrunkId_fkey" FOREIGN KEY ("carrierTrunkId") REFERENCES "CarrierTrunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
