-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Region" ADD VALUE 'US_CENTRAL';
ALTER TYPE "Region" ADD VALUE 'CANADA_EAST';
ALTER TYPE "Region" ADD VALUE 'CANADA_WEST';
ALTER TYPE "Region" ADD VALUE 'EUROPE_NORTH';
ALTER TYPE "Region" ADD VALUE 'EUROPE_SOUTH';
ALTER TYPE "Region" ADD VALUE 'SOUTH_KOREA';
ALTER TYPE "Region" ADD VALUE 'TAIWAN';
ALTER TYPE "Region" ADD VALUE 'CHINA_MAINLAND';
ALTER TYPE "Region" ADD VALUE 'HONG_KONG';
ALTER TYPE "Region" ADD VALUE 'SOUTHEAST_ASIA';
ALTER TYPE "Region" ADD VALUE 'OCEANIA';
ALTER TYPE "Region" ADD VALUE 'SOUTH_AMERICA_WEST';
ALTER TYPE "Region" ADD VALUE 'SOUTH_AMERICA_EAST';
ALTER TYPE "Region" ADD VALUE 'MEXICO';
ALTER TYPE "Region" ADD VALUE 'CENTRAL_AMERICA';
ALTER TYPE "Region" ADD VALUE 'AFRICA_NORTH';
ALTER TYPE "Region" ADD VALUE 'AFRICA_WEST';
ALTER TYPE "Region" ADD VALUE 'AFRICA_EAST';
ALTER TYPE "Region" ADD VALUE 'MIDDLE_EAST';
ALTER TYPE "Region" ADD VALUE 'RUSSIA';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailAlertQuota" SET DEFAULT 10,
ALTER COLUMN "emailAlertReset" SET DEFAULT NOW() + INTERVAL '1 day';
