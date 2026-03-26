/*
  Warnings:

  - You are about to alter the column `price` on the `turf_slot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "turf" ALTER COLUMN "hourlyRate" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "turf_slot" ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
