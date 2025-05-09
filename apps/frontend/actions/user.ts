'use server';

import { prismaClient } from 'db/client';
import { getUserFromJWT } from '@/lib/auth';
import { NotificationConfig } from '@prisma/client';
import { randomBytes } from 'crypto';

export async function updateUserEmail(email: string | null) {
  const user = await getUserFromJWT();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.userId },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  const updatedUser = await prismaClient.user.update({
    where: { id: user.userId },
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
  const user = await getUserFromJWT();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.userId },
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
          userId: user.userId,
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
    where: { id: user.userId },
    data: {
      notificationConfig: {
        upsert: {
          where: {
            userId_websiteId: {
              userId: user.userId,
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
  const user = await getUserFromJWT();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const notificationConfig = await prismaClient.notificationConfig.findUnique({
    where: {
      userId_websiteId: {
        userId: user.userId,
        websiteId: id,
      },
    },
  });

  return notificationConfig;
}
