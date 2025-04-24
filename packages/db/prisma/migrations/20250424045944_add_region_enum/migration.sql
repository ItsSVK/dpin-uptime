/*
  Warnings:

  - Changed the type of `region` on the `Validator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `region` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Region" AS ENUM ('EUROPE', 'NORTH_AMERICA', 'ASIA', 'AUSTRALIA');

-- Add temporary columns
ALTER TABLE "Validator" ADD COLUMN "new_region" "Region";
ALTER TABLE "WebsiteTick" ADD COLUMN "region" "Region";

-- Map existing region strings to enum values for Validator
UPDATE "Validator"
SET "new_region" = CASE
    WHEN region LIKE '%europe%' OR region LIKE '%eu%' THEN 'EUROPE'::"Region"
    WHEN region LIKE '%asia%' THEN 'ASIA'::"Region"
    WHEN region LIKE '%america%' OR region LIKE '%us%' OR region LIKE '%canada%' THEN 'NORTH_AMERICA'::"Region"
    WHEN region LIKE '%australia%' OR region LIKE '%oceania%' THEN 'AUSTRALIA'::"Region"
    ELSE 'EUROPE'::"Region" -- Default to EUROPE for unknown regions
END;

-- Set default region for existing WebsiteTicks based on their validator's region
UPDATE "WebsiteTick" wt
SET "region" = v."new_region"
FROM "Validator" v
WHERE wt."validatorId" = v.id;

-- Make the new columns required
ALTER TABLE "Validator" ALTER COLUMN "new_region" SET NOT NULL;
ALTER TABLE "WebsiteTick" ALTER COLUMN "region" SET NOT NULL;

-- Drop the old region column and rename the new one
ALTER TABLE "Validator" DROP COLUMN "region";
ALTER TABLE "Validator" RENAME COLUMN "new_region" TO "region";
