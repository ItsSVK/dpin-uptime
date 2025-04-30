-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_validatorId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "validatorId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
