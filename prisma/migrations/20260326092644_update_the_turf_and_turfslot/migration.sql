/*
  Warnings:

  - You are about to drop the column `sportTypeId` on the `turf` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "turf" DROP CONSTRAINT "turf_sportTypeId_fkey";

-- DropIndex
DROP INDEX "account_userId_idx";

-- DropIndex
DROP INDEX "booking_playerId_turfId_idx";

-- DropIndex
DROP INDEX "player_email_isDeleted_idx";

-- DropIndex
DROP INDEX "session_userId_idx";

-- DropIndex
DROP INDEX "turf_address_sportTypeId_idx";

-- DropIndex
DROP INDEX "turf_slot_turfId_slotId_key";

-- DropIndex
DROP INDEX "verification_identifier_idx";

-- AlterTable
ALTER TABLE "turf" DROP COLUMN "sportTypeId";

-- CreateTable
CREATE TABLE "_SportTypeToTurf" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SportTypeToTurf_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SportTypeToTurf_B_index" ON "_SportTypeToTurf"("B");

-- CreateIndex
CREATE INDEX "idx_booking_playerId" ON "booking"("playerId");

-- CreateIndex
CREATE INDEX "idx_turfId" ON "booking"("turfId");

-- CreateIndex
CREATE INDEX "idx_player_email" ON "player"("email");

-- CreateIndex
CREATE INDEX "idx_player_isDeleted" ON "player"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_review_turfId" ON "review"("turfId");

-- CreateIndex
CREATE INDEX "idx_isDeleted" ON "system_admin"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_turf_address" ON "turf"("address");

-- CreateIndex
CREATE INDEX "idx_turfowner_isDeleted" ON "turf_owner"("isDeleted");

-- AddForeignKey
ALTER TABLE "_SportTypeToTurf" ADD CONSTRAINT "_SportTypeToTurf_A_fkey" FOREIGN KEY ("A") REFERENCES "sport_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportTypeToTurf" ADD CONSTRAINT "_SportTypeToTurf_B_fkey" FOREIGN KEY ("B") REFERENCES "turf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "payment_status_idx" RENAME TO "idx_payment_status";

-- RenameIndex
ALTER INDEX "review_playerId_turfId_idx" RENAME TO "idx_review_playerId";

-- RenameIndex
ALTER INDEX "system_admin_email_isDeleted_idx" RENAME TO "idx_sysadmin_email";

-- RenameIndex
ALTER INDEX "turf_owner_email_isDeleted_idx" RENAME TO "idx_turfowner_email";

-- RenameIndex
ALTER INDEX "turf_slot_slotId_idx" RENAME TO "idx_turfslot_slotId";

-- RenameIndex
ALTER INDEX "turf_slot_turfId_idx" RENAME TO "idx_turfslot_turfId";
