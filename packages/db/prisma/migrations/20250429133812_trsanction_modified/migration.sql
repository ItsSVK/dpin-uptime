/*
  Warnings:

  - You are about to drop the `Deposit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `transactionType` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'PAYOUT');

-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_userId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transactionType" "TransactionType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Deposit";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
