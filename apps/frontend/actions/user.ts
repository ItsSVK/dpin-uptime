'use server';

import { prismaClient } from 'db/client';
import { getUserFromJWT } from '@/lib/auth';
import { NotificationConfig } from '@prisma/client';

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
  updateConfig: Omit<NotificationConfig, 'userId' | 'createdAt'>
) {
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
          },
          create: {
            ...updateConfig,
          },
        },
      },
    },
  });

  return updatedUser;
}
