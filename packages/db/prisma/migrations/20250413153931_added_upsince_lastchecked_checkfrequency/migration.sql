-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "checkFrequency" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "upSince" TIMESTAMP(3);
