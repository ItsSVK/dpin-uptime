-- AlterTable
ALTER TABLE "NotificationConfig" ADD COLUMN     "webhookSecret" TEXT,
ADD COLUMN     "webhookUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailAlertReset" SET DEFAULT NOW() + INTERVAL '1 day';
