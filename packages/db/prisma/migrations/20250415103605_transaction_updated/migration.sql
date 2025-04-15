-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Success', 'Failure');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'Pending';
