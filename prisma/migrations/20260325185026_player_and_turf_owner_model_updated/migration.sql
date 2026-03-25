-- AlterTable
ALTER TABLE "player" ALTER COLUMN "profilePhoto" DROP NOT NULL,
ALTER COLUMN "contactNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "turf_owner" ALTER COLUMN "profilePhoto" DROP NOT NULL,
ALTER COLUMN "contactNumber" DROP NOT NULL;
