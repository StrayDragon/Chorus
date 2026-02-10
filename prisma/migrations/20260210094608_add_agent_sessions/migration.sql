-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "sessionName" TEXT,
ADD COLUMN     "sessionUuid" TEXT;

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "agentUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTaskCheckin" (
    "id" SERIAL NOT NULL,
    "sessionUuid" TEXT NOT NULL,
    "taskUuid" TEXT NOT NULL,
    "checkinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkoutAt" TIMESTAMP(3),

    CONSTRAINT "SessionTaskCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentSession_uuid_key" ON "AgentSession"("uuid");

-- CreateIndex
CREATE INDEX "AgentSession_companyUuid_idx" ON "AgentSession"("companyUuid");

-- CreateIndex
CREATE INDEX "AgentSession_agentUuid_idx" ON "AgentSession"("agentUuid");

-- CreateIndex
CREATE INDEX "AgentSession_status_idx" ON "AgentSession"("status");

-- CreateIndex
CREATE INDEX "SessionTaskCheckin_sessionUuid_idx" ON "SessionTaskCheckin"("sessionUuid");

-- CreateIndex
CREATE INDEX "SessionTaskCheckin_taskUuid_idx" ON "SessionTaskCheckin"("taskUuid");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTaskCheckin_sessionUuid_taskUuid_key" ON "SessionTaskCheckin"("sessionUuid", "taskUuid");
