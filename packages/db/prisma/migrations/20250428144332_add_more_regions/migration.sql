/*
  Warnings:

  - The values [EUROPE,NORTH_AMERICA,ASIA] on the enum `Region` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Region_new" AS ENUM ('US_EAST', 'US_WEST', 'EUROPE_WEST', 'EUROPE_EAST', 'INDIA', 'JAPAN', 'SINGAPORE', 'AUSTRALIA', 'BRAZIL', 'SOUTH_AFRICA');
ALTER TABLE "Validator" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TABLE "WebsiteTick" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TYPE "Region" RENAME TO "Region_old";
ALTER TYPE "Region_new" RENAME TO "Region";
DROP TYPE "Region_old";
COMMIT;
