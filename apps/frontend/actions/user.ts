'use server';

import { prismaClient } from 'db/client';
import { NotificationConfig } from '@prisma/client';
import { randomBytes } from 'crypto';
import { getUser } from '@civic/auth-web3/nextjs';

export async function updateUserEmail(email: string | null) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: { email: email || null },
  });

  return updatedUser;
}

export async function updateNotificationConfig(
  updateConfig: Pick<
    NotificationConfig,
    | 'webhookUrl'
    | 'isDownAlertEnabled'
    | 'isHighPingAlertEnabled'
    | 'email'
    | 'websiteId'
    | 'webhookSecret'
  >
) {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  const oldNotificationConfig =
    await prismaClient.notificationConfig.findUnique({
      where: {
        userId_websiteId: {
          userId: user.id,
          websiteId: updateConfig.websiteId,
        },
      },
    });

  const webhookSecret = randomBytes(32).toString('hex');

  if (oldNotificationConfig) {
    if (
      oldNotificationConfig.webhookUrl &&
      updateConfig.webhookUrl &&
      !updateConfig.webhookSecret
    ) {
      updateConfig.webhookSecret = webhookSecret;
    } else if (
      oldNotificationConfig.webhookUrl &&
      !updateConfig.webhookUrl &&
      updateConfig.webhookSecret
    ) {
      updateConfig.webhookSecret = null;
    } else if (!oldNotificationConfig.webhookUrl && updateConfig.webhookUrl) {
      updateConfig.webhookSecret = webhookSecret;
    }
  }

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      notificationConfig: {
        upsert: {
          where: {
            userId_websiteId: {
              userId: user.id,
              websiteId: updateConfig.websiteId,
            },
          },
          update: {
            isHighPingAlertEnabled: updateConfig.isHighPingAlertEnabled,
            isDownAlertEnabled: updateConfig.isDownAlertEnabled,
            email: updateConfig.email || null,
            webhookUrl: updateConfig.webhookUrl || null,
            webhookSecret: updateConfig.webhookSecret || null,
          },
          create: {
            ...updateConfig,
          },
        },
      },
    },
    include: {
      notificationConfig: true,
    },
  });

  return {
    success: true,
    message: 'Notification settings updated',
    data: updatedUser,
  };
}

export async function getNotificationConfig(id: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const notificationConfig = await prismaClient.notificationConfig.findUnique({
    where: {
      userId_websiteId: {
        userId: user.id,
        websiteId: id,
      },
    },
  });

  return notificationConfig;
}

export async function testWebhookAction(webhookUrl: string) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test webhook' }),
    });
    if (!res.ok) {
      return { success: false, status: res.status };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
