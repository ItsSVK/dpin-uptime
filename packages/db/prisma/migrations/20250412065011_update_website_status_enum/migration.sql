/*
  Warnings:

  - The values [Good,Bad] on the enum `WebsiteStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `location` on the `Validator` table. All the data in the column will be lost.
  - Added the required column `city` to the `Validator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Validator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Validator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Validator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WebsiteStatus_new" AS ENUM ('GOOD', 'BAD');
ALTER TABLE "WebsiteTick" ALTER COLUMN "status" TYPE "WebsiteStatus_new" USING ("status"::text::"WebsiteStatus_new");
ALTER TYPE "WebsiteStatus" RENAME TO "WebsiteStatus_old";
ALTER TYPE "WebsiteStatus_new" RENAME TO "WebsiteStatus";
DROP TYPE "WebsiteStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
