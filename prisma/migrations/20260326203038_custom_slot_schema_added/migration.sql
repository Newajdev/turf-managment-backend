/*
  Warnings:

  - A unique constraint covering the columns `[customSlotId]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customSlotId` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "customSlotId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "custom_turf_slot" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "turfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_turf_slot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_customSlot_turfId" ON "custom_turf_slot"("turfId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_customSlotId_key" ON "booking"("customSlotId");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customSlotId_fkey" FOREIGN KEY ("customSlotId") REFERENCES "custom_turf_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_turf_slot" ADD CONSTRAINT "custom_turf_slot_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "turf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
