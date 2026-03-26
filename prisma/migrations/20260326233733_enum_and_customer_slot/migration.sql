/*
  Warnings:

  - You are about to drop the column `isActive` on the `custom_turf_slot` table. All the data in the column will be lost.
  - Added the required column `playerId` to the `custom_turf_slot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "booking_customSlotId_key";

-- DropIndex
DROP INDEX "booking_date_key";

-- DropIndex
DROP INDEX "booking_turfSlotId_key";

-- AlterTable
ALTER TABLE "booking" ALTER COLUMN "turfSlotId" DROP NOT NULL,
ALTER COLUMN "customSlotId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "custom_turf_slot" DROP COLUMN "isActive",
ADD COLUMN     "isBooked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "turf_slot" ALTER COLUMN "isBooking" SET DEFAULT false;

-- CreateTable
CREATE TABLE "_PlayerToTurf" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlayerToTurf_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PlayerToTurf_B_index" ON "_PlayerToTurf"("B");

-- AddForeignKey
ALTER TABLE "custom_turf_slot" ADD CONSTRAINT "custom_turf_slot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToTurf" ADD CONSTRAINT "_PlayerToTurf_A_fkey" FOREIGN KEY ("A") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToTurf" ADD CONSTRAINT "_PlayerToTurf_B_fkey" FOREIGN KEY ("B") REFERENCES "turf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
