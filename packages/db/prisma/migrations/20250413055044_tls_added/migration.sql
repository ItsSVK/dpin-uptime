/*
  Warnings:

  - You are about to drop the column `latency` on the `WebsiteTick` table. All the data in the column will be lost.
  - You are about to drop the column `tlsLatency` on the `WebsiteTick` table. All the data in the column will be lost.
  - Added the required column `dns` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `error` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tcp` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tls` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ttfb` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteTick" DROP COLUMN "latency",
DROP COLUMN "tlsLatency",
ADD COLUMN     "dns" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "error" TEXT NOT NULL,
ADD COLUMN     "tcp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tls" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ttfb" DOUBLE PRECISION NOT NULL;
