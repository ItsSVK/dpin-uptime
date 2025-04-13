/*
  Warnings:

  - You are about to drop the column `dns` on the `WebsiteTick` table. All the data in the column will be lost.
  - You are about to drop the column `tcp` on the `WebsiteTick` table. All the data in the column will be lost.
  - You are about to drop the column `tls` on the `WebsiteTick` table. All the data in the column will be lost.
  - Added the required column `connection` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataTransfer` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameLookup` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tlsHandshake` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteTick" DROP COLUMN "dns",
DROP COLUMN "tcp",
DROP COLUMN "tls",
ADD COLUMN     "connection" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dataTransfer" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "nameLookup" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tlsHandshake" DOUBLE PRECISION NOT NULL;
