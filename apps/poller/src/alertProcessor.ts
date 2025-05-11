import { prismaClient } from 'db/client';
import { WebsiteAlertStatus, WebsiteAlertType } from '@prisma/client';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const alertPollingInterval = 30000; // 30 seconds
let alertPollingTimer: NodeJS.Timeout | null = null;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // e.g., smtp.gmail.com
  port: 465, // or 465 for SSL and 587 for TLS
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function updateWebsiteAlertRetryStatus(id: string) {
  await prismaClient.websiteAlert.update({
    where: { id },
    data: {
      retryCount: { increment: 1 },
    },
  });
}

async function updateWebsiteAlertSentStatus(id: string) {
  await prismaClient.websiteAlert.update({
    where: { id },
    data: { status: WebsiteAlertStatus.SENT, sentAt: new Date() },
  });
}

async function updateWebsiteAlertFailedStatus(id: string) {
  await prismaClient.websiteAlert.update({
    where: { id },
    data: { status: WebsiteAlertStatus.FAILED },
  });
}

async function processPendingAlerts() {
  const pendingAlerts = await prismaClient.websiteAlert.findMany({
    where: {
      status: WebsiteAlertStatus.PENDING,
    },
    take: 10,
    include: {
      website: true,
      user: true,
    },
  });

  for (const alert of pendingAlerts) {
    try {
      const content = JSON.parse(alert.content);

      if (alert.retryCount >= 3) {
        await updateWebsiteAlertFailedStatus(alert.id);
        continue;
      }

      if (alert.alertType === WebsiteAlertType.EMAIL) {
        const info = await transporter.sendMail(content);

        if (info.rejected.length > 0) {
          console.error(
            `❌ Failed to send email alert to ${alert.to}:`,
            info.rejected
          );
          await updateWebsiteAlertRetryStatus(alert.id);
        } else {
          await updateWebsiteAlertSentStatus(alert.id);
          console.log(
            `✅ Sent email alert to ${alert.to} for website ${alert.website.url}`
          );
        }
      } else if (alert.alertType === WebsiteAlertType.WEBHOOK) {
        const notificationConfig =
          await prismaClient.notificationConfig.findUnique({
            where: {
              userId: alert.user.id,
              websiteId: alert.website.id,
            },
          });

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (notificationConfig?.webhookSecret) {
          headers['X-Webhook-Secret'] = notificationConfig.webhookSecret;
        }

        const response = await fetch(alert.to, {
          method: 'POST',
          headers,
          body: JSON.stringify(content),
        });

        if (!response.ok) {
          console.error(
            `❌ Failed to send webhook alert to ${alert.to}:`,
            response.statusText
          );
          await updateWebsiteAlertRetryStatus(alert.id);
        } else {
          await updateWebsiteAlertSentStatus(alert.id);
          console.log(
            `✅ Sent webhook alert to ${alert.to} for website ${alert.website.url}`
          );
        }
      }
    } catch (error) {
      await updateWebsiteAlertRetryStatus(alert.id);
      console.error(`❌ Failed to send email alert to ${alert.to}:`, error);
    }
  }
}

export function startAlertPolling() {
  if (alertPollingTimer) {
    console.log('Alert polling is already running.');
    return;
  }
  console.log('Starting alert processor...');
  alertPollingTimer = setInterval(processPendingAlerts, alertPollingInterval);
}

export function stopAlertPolling() {
  if (alertPollingTimer) {
    clearInterval(alertPollingTimer);
    alertPollingTimer = null;
    console.log('Alert processor stopped.');
  }
}
