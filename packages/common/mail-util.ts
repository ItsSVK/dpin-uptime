import { prismaClient } from 'db/client';
import { WebsiteAlertType } from '@prisma/client';

export async function createAlert(
  to: string,
  content: string,
  userId: string,
  websiteId: string,
  alertType: WebsiteAlertType
) {
  const alert = await prismaClient.websiteAlert.create({
    data: {
      to,
      content,
      alertType,
      user: {
        connect: {
          id: userId,
        },
      },
      website: {
        connect: {
          id: websiteId,
        },
      },
    },
  });

  return alert;
}
