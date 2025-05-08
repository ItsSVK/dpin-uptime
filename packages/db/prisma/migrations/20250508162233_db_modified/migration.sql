-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailAlertQuota" SET DEFAULT 200,
ALTER COLUMN "emailAlertReset" SET DEFAULT NOW() + INTERVAL '1 day';
