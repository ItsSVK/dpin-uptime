-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailAlertReset" SET DEFAULT NOW() + INTERVAL '1 day';
