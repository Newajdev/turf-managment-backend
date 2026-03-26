-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'PAYMENT', 'MAINTENANCE', 'SYSTEM', 'ACCOUNT');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('MISLEADING_INFORMATION', 'BAD_SERVICE', 'SAFETY_CONCERNS', 'UNHYGIENIC', 'OVERPRICED', 'OTHER');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "turfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turf_maintenance" (
    "id" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "notice" TEXT NOT NULL,
    "turfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turf_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_notification_user_id" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "idx_report_playerId" ON "report"("playerId");

-- CreateIndex
CREATE INDEX "idx_report_turfId" ON "report"("turfId");

-- CreateIndex
CREATE INDEX "idx_turf_maintenance_turfId" ON "turf_maintenance"("turfId");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "turf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turf_maintenance" ADD CONSTRAINT "turf_maintenance_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "turf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
