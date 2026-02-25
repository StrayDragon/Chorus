-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "groupUuid" TEXT;

-- CreateTable
CREATE TABLE "ProjectGroup" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectGroup_uuid_key" ON "ProjectGroup"("uuid");

-- CreateIndex
CREATE INDEX "ProjectGroup_companyUuid_idx" ON "ProjectGroup"("companyUuid");

-- CreateIndex
CREATE INDEX "Project_groupUuid_idx" ON "Project"("groupUuid");
