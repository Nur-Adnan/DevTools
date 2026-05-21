-- CreateTable
CREATE TABLE "LogGroup" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LogGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogGroup_fingerprint_key" ON "LogGroup"("fingerprint");

-- CreateIndex
CREATE INDEX "LogGroup_projectId_idx" ON "LogGroup"("projectId");

-- AddForeignKey
ALTER TABLE "LogGroup" ADD CONSTRAINT "LogGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
