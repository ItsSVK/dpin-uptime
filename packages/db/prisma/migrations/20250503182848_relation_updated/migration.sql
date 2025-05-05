/*
  Warnings:

  - A unique constraint covering the columns `[websiteId]` on the table `NotificationConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NotificationConfig_websiteId_key" ON "NotificationConfig"("websiteId");
