/*
  Warnings:

  - Changed the type of `period` on the `UptimeHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UptimePeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
-- First, add a new column for the enum
ALTER TABLE "UptimeHistory" ADD COLUMN "new_period" "UptimePeriod";

-- Update the new column based on existing values
UPDATE "UptimeHistory" SET "new_period" = 
  CASE 
    WHEN period = 'daily' THEN 'DAILY'::"UptimePeriod"
    WHEN period = 'weekly' THEN 'WEEKLY'::"UptimePeriod"
    WHEN period = 'monthly' THEN 'MONTHLY'::"UptimePeriod"
  END;

-- Drop the old unique index
DROP INDEX "UptimeHistory_websiteId_period_startDate_key";

-- Drop the old column and rename the new one
ALTER TABLE "UptimeHistory" DROP COLUMN "period";
ALTER TABLE "UptimeHistory" RENAME COLUMN "new_period" TO "period";

-- Make the column NOT NULL
ALTER TABLE "UptimeHistory" ALTER COLUMN "period" SET NOT NULL;

-- Recreate the unique index
CREATE UNIQUE INDEX "UptimeHistory_websiteId_period_startDate_key" ON "UptimeHistory"("websiteId", "period", "startDate");
