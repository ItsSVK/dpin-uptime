/*
  Warnings:

  - The primary key for the `NotificationConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `slack` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `slackUrl` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `sms` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `webhook` on the `NotificationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `webhookUrl` on the `NotificationConfig` table. All the data in the column will be lost.
  - Added the required column `userId` to the `NotificationConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "NotificationConfig_websiteId_key";

-- AlterTable
ALTER TABLE "NotificationConfig" DROP CONSTRAINT "NotificationConfig_pkey",
DROP COLUMN "id",
DROP COLUMN "slack",
DROP COLUMN "slackUrl",
DROP COLUMN "sms",
DROP COLUMN "updatedAt",
DROP COLUMN "webhook",
DROP COLUMN "webhookUrl",
ADD COLUMN     "isDownAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHighPingAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" DROP DEFAULT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ADD CONSTRAINT "NotificationConfig_pkey" PRIMARY KEY ("userId", "websiteId");

-- AddForeignKey
ALTER TABLE "NotificationConfig" ADD CONSTRAINT "NotificationConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
