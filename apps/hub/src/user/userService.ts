import { prismaClient } from 'db/client';
import type { User } from '@prisma/client';

export async function updateUserData(userId: string, data: Partial<User>) {
  const updatedUser = await prismaClient.user.update({
    where: { id: userId },
    data: data,
  });

  return updatedUser;
}

setInterval(
  async () => {
    try {
      const users = await prismaClient.user.findMany({
        where: {
          emailAlertReset: { lte: new Date() },
        },
      });

      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setMonth(now.getMonth() + 1);

      for (const user of users) {
        await prismaClient.user.update({
          where: { id: user.id },
          data: {
            emailAlertQuota: 6,
            emailAlertReset: {
              set: nextReset,
            },
          },
        });
      }
      console.log(
        `[${new Date().toISOString()}] Quota reset for ${users.length} users.`
      );
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Failed to reset quotas:`,
        err
      );
    }
  },
  1000 * 60 * 30
);
