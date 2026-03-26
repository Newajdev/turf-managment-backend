/*
  Warnings:

  - A unique constraint covering the columns `[startTime,endTime]` on the table `master_slot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `closingTime` to the `turf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingTime` to the `turf` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeeklyOffDay" AS ENUM ('FRIDAY', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY');

-- CreateEnum
CREATE TYPE "TurfStatus" AS ENUM ('ACTIVE', 'DISABLED', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "turf" ADD COLUMN     "closingTime" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT[],
ADD COLUMN     "emailAddress" TEXT,
ADD COLUMN     "isAlwaysOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openingTime" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saveCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "turfStatus" "TurfStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "weeklyOffDays" "WeeklyOffDay"[];

-- CreateIndex
CREATE UNIQUE INDEX "master_slot_startTime_endTime_key" ON "master_slot"("startTime", "endTime");
