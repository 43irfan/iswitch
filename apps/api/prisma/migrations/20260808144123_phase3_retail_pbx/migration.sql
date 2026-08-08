-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'ERROR', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DidDestinationType" AS ENUM ('EXTENSION', 'RING_GROUP', 'QUEUE', 'IVR', 'EXTERNAL', 'VOICEMAIL');

-- CreateEnum
CREATE TYPE "RingStrategy" AS ENUM ('RINGALL', 'LEASTRECENT', 'FEWESTCALLS', 'RANDOM', 'RRMEMORY');

-- CreateTable
CREATE TABLE "Extension" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "displayName" TEXT,
    "sipUsername" TEXT NOT NULL,
    "sipPassword" TEXT NOT NULL,
    "callerId" TEXT,
    "dnd" BOOLEAN NOT NULL DEFAULT false,
    "forwardTo" TEXT,
    "voicemailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Did" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT,
    "destinationType" "DidDestinationType" NOT NULL,
    "destinationRef" TEXT NOT NULL,
    "callerIdName" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Did_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RingGroup" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategy" "RingStrategy" NOT NULL DEFAULT 'RINGALL',
    "ringTimeout" INTEGER NOT NULL DEFAULT 20,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RingGroupMember" (
    "id" TEXT NOT NULL,
    "ringGroupId" TEXT NOT NULL,
    "extensionId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RingGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallQueue" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT,
    "strategy" "RingStrategy" NOT NULL DEFAULT 'RINGALL',
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "musicOnHold" TEXT NOT NULL DEFAULT 'default',
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueMember" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "extensionId" TEXT NOT NULL,
    "penalty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QueueMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IvrMenu" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "greetingPrompt" TEXT NOT NULL DEFAULT 'welcome',
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 5,
    "options" JSONB NOT NULL DEFAULT '{}',
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IvrMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoicemailBox" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "mailbox" TEXT NOT NULL,
    "pin" TEXT NOT NULL DEFAULT '0000',
    "email" TEXT,
    "extensionId" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoicemailBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncAudit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Extension_accountId_idx" ON "Extension"("accountId");

-- CreateIndex
CREATE INDEX "Extension_userId_idx" ON "Extension"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_accountId_number_key" ON "Extension"("accountId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_accountId_sipUsername_key" ON "Extension"("accountId", "sipUsername");

-- CreateIndex
CREATE INDEX "Did_accountId_idx" ON "Did"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Did_number_key" ON "Did"("number");

-- CreateIndex
CREATE INDEX "RingGroup_accountId_idx" ON "RingGroup"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "RingGroup_accountId_name_key" ON "RingGroup"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RingGroupMember_ringGroupId_extensionId_key" ON "RingGroupMember"("ringGroupId", "extensionId");

-- CreateIndex
CREATE INDEX "CallQueue_accountId_idx" ON "CallQueue"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "CallQueue_accountId_name_key" ON "CallQueue"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "QueueMember_queueId_extensionId_key" ON "QueueMember"("queueId", "extensionId");

-- CreateIndex
CREATE INDEX "IvrMenu_accountId_idx" ON "IvrMenu"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "IvrMenu_accountId_name_key" ON "IvrMenu"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "VoicemailBox_extensionId_key" ON "VoicemailBox"("extensionId");

-- CreateIndex
CREATE INDEX "VoicemailBox_accountId_idx" ON "VoicemailBox"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "VoicemailBox_accountId_mailbox_key" ON "VoicemailBox"("accountId", "mailbox");

-- CreateIndex
CREATE INDEX "SyncAudit_entityType_entityId_idx" ON "SyncAudit"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SyncAudit_createdAt_idx" ON "SyncAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "Extension" ADD CONSTRAINT "Extension_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extension" ADD CONSTRAINT "Extension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Did" ADD CONSTRAINT "Did_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RingGroup" ADD CONSTRAINT "RingGroup_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RingGroupMember" ADD CONSTRAINT "RingGroupMember_ringGroupId_fkey" FOREIGN KEY ("ringGroupId") REFERENCES "RingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RingGroupMember" ADD CONSTRAINT "RingGroupMember_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallQueue" ADD CONSTRAINT "CallQueue_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueMember" ADD CONSTRAINT "QueueMember_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "CallQueue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueMember" ADD CONSTRAINT "QueueMember_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IvrMenu" ADD CONSTRAINT "IvrMenu_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicemailBox" ADD CONSTRAINT "VoicemailBox_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicemailBox" ADD CONSTRAINT "VoicemailBox_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE SET NULL ON UPDATE CASCADE;
