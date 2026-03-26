/*
  Warnings:

  - You are about to alter the column `rating` on the `turf` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - Made the column `duration` on table `master_slot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "master_slot" ALTER COLUMN "duration" SET NOT NULL;

-- AlterTable
ALTER TABLE "turf" ADD COLUMN     "hourlyRate" DECIMAL(3,2) NOT NULL DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,2);
