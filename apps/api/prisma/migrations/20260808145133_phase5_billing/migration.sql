-- CreateEnum
CREATE TYPE "CdrDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERNAL');

-- CreateEnum
CREATE TYPE "CdrStatus" AS ENUM ('RECEIVED', 'RATED', 'ERROR', 'SKIPPED');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "defaultRateMicros" BIGINT NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "Cdr" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" "CdrDirection" NOT NULL DEFAULT 'OUTBOUND',
    "caller" TEXT NOT NULL,
    "callee" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "answerAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "billsec" INTEGER NOT NULL DEFAULT 0,
    "disposition" TEXT,
    "customerTrunkId" TEXT,
    "carrierTrunkId" TEXT,
    "routePrefixId" TEXT,
    "rateMicros" BIGINT,
    "costMicros" BIGINT,
    "chargeMicros" BIGINT NOT NULL DEFAULT 0,
    "status" "CdrStatus" NOT NULL DEFAULT 'RECEIVED',
    "ratedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cdr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceLedger" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "cdrId" TEXT,
    "deltaMicros" BIGINT NOT NULL,
    "balanceAfterMicros" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cdr_uniqueId_key" ON "Cdr"("uniqueId");

-- CreateIndex
CREATE INDEX "Cdr_accountId_createdAt_idx" ON "Cdr"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "Cdr_status_idx" ON "Cdr"("status");

-- CreateIndex
CREATE INDEX "Cdr_callee_idx" ON "Cdr"("callee");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceLedger_cdrId_key" ON "BalanceLedger"("cdrId");

-- CreateIndex
CREATE INDEX "BalanceLedger_accountId_createdAt_idx" ON "BalanceLedger"("accountId", "createdAt");

-- AddForeignKey
ALTER TABLE "Cdr" ADD CONSTRAINT "Cdr_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceLedger" ADD CONSTRAINT "BalanceLedger_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceLedger" ADD CONSTRAINT "BalanceLedger_cdrId_fkey" FOREIGN KEY ("cdrId") REFERENCES "Cdr"("id") ON DELETE SET NULL ON UPDATE CASCADE;
