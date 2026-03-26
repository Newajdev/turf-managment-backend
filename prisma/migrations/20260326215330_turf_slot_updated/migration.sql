/*
  Warnings:

  - You are about to drop the column `isActive` on the `turf_slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "turf_slot" DROP COLUMN "isActive",
ADD COLUMN     "isBooking" BOOLEAN NOT NULL DEFAULT true;
