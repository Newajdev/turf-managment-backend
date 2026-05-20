/*
  Warnings:

  - Added the required column `date` to the `custom_turf_slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playersCount` to the `custom_turf_slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportType` to the `custom_turf_slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "custom_turf_slot" ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "playersCount" INTEGER NOT NULL,
ADD COLUMN     "sportType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "turf" ADD COLUMN     "amenities" TEXT[];
