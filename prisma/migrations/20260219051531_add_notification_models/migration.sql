-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "projectUuid" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientUuid" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityUuid" TEXT NOT NULL,
    "entityTitle" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorUuid" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerUuid" TEXT NOT NULL,
    "taskAssigned" BOOLEAN NOT NULL DEFAULT true,
    "taskStatusChanged" BOOLEAN NOT NULL DEFAULT true,
    "taskVerified" BOOLEAN NOT NULL DEFAULT true,
    "taskReopened" BOOLEAN NOT NULL DEFAULT true,
    "proposalSubmitted" BOOLEAN NOT NULL DEFAULT true,
    "proposalApproved" BOOLEAN NOT NULL DEFAULT true,
    "proposalRejected" BOOLEAN NOT NULL DEFAULT true,
    "ideaClaimed" BOOLEAN NOT NULL DEFAULT true,
    "commentAdded" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_uuid_key" ON "Notification"("uuid");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientUuid_readAt_idx" ON "Notification"("recipientType", "recipientUuid", "readAt");

-- CreateIndex
CREATE INDEX "Notification_companyUuid_recipientUuid_idx" ON "Notification"("companyUuid", "recipientUuid");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityUuid_idx" ON "Notification"("entityType", "entityUuid");

-- CreateIndex
CREATE INDEX "Notification_projectUuid_idx" ON "Notification"("projectUuid");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_uuid_key" ON "NotificationPreference"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_ownerType_ownerUuid_key" ON "NotificationPreference"("ownerType", "ownerUuid");

-- CreateIndex
CREATE INDEX "NotificationPreference_companyUuid_idx" ON "NotificationPreference"("companyUuid");
