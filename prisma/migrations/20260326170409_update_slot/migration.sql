/*
  Warnings:

  - Added the required column `slotType` to the `master_slot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- AlterTable
ALTER TABLE "master_slot" ADD COLUMN     "slotType" "SlotType" NOT NULL;
