/*
  Warnings:

  - Added the required column `tlsLatency` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteTick" ADD COLUMN     "tlsLatency" DOUBLE PRECISION NOT NULL;
