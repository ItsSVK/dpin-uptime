/*
  Warnings:

  - You are about to drop the column `retries` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `instructionData` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructionType` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "retries",
ADD COLUMN     "instructionData" JSONB NOT NULL,
ADD COLUMN     "instructionType" TEXT NOT NULL,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
