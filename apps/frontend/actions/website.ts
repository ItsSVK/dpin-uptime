'use server';

import { Website, WebsiteTick } from '@/types/website';
import { prismaClient } from 'db/client';
import { formatUrl } from '@/lib/url';
import {
  NotificationConfig,
  User,
  WebsiteAlertType,
  WebsiteStatus,
} from '@prisma/client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  sendWebsitePingAnomalyEmail,
  sendWebsiteStatusEmail,
} from 'common/node-mail';
import { createAlert } from 'common/mail-util';
import { getUser } from '@civic/auth-web3/nextjs';
import { getDBUserFromSession } from '@/actions/deposit';

interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function getWebsite(id: string): Promise<
  Response<
    Website & {
      ticks: WebsiteTick[];
      notificationConfig: NotificationConfig;
      user: {
        emailAlertQuota: number;
        emailAlertReset: Date;
      };
    }
  >
> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const data = await prismaClient.website.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      ticks: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      uptimeHistory: true,
      notificationConfig: {
        where: {
          userId: user.id,
        },
      },
      user: {
        select: {
          emailAlertQuota: true,
          emailAlertReset: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      message: 'Website not found',
    };
  }

  return {
    success: true,
    data: {
      ...data,
      notificationConfig: data.notificationConfig || {
        email: null,
        userId: user.id,
        websiteId: id,
        isHighPingAlertEnabled: false,
        isDownAlertEnabled: false,
        createdAt: new Date(),
        webhookUrl: null,
        webhookSecret: null,
      },
    },
  };
}

export async function getWebsites(): Promise<
  Response<(Website & { ticks: WebsiteTick[]; user: User })[]>
> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const data = await prismaClient.website.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      ticks: true,
      user: true,
    },
  });

  return {
    success: true,
    data,
  };
}

export async function createWebsite(
  url: string,
  urlName: string,
  checkFrequency: number,
  preferredRegion?: string
): Promise<Response<Website>> {
  const user = await getDBUserFromSession();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  if (!user.currentBalance || user.currentBalance < 0.1 * LAMPORTS_PER_SOL) {
    return {
      success: false,
      message:
        'Insufficient balance. Add more SOL to your balance to continue monitoring',
    };
  }
  const formattedUrl = formatUrl(url);
  const name = urlName || new URL(formattedUrl).hostname;

  const data = await prismaClient.website.create({
    data: {
      url: formattedUrl,
      name,
      userId: user.id,
      status: WebsiteStatus.UNKNOWN,
      checkFrequency,
      uptimePercentage: 100,
      monitoringSince: new Date(),
      preferredRegion: preferredRegion || undefined,
      notificationConfig: {
        create: {
          userId: user.id,
          email: null,
          isHighPingAlertEnabled: false,
          isDownAlertEnabled: false,
          createdAt: new Date(),
        },
      },
    },
  });

  return {
    success: true,
    data,
  };
}

export async function updateWebsite(
  id: string,
  data: Partial<Website>
): Promise<Response<Website & { ticks: WebsiteTick[] }>> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const userBalance = await getDBUserFromSession();
  if (!userBalance) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  if (
    !userBalance.currentBalance ||
    userBalance.currentBalance < 0.1 * LAMPORTS_PER_SOL
  ) {
    return {
      success: false,
      message:
        'Insufficient balance. Add more SOL to your balance to continue monitoring',
    };
  }

  const updatedData = await prismaClient.website.update({
    where: {
      id,
      userId: user.id,
    },
    data,
    include: {
      ticks: true,
    },
  });

  return {
    success: true,
    data: updatedData,
  };
}

export async function deleteWebsite(ids: string[]): Promise<Response<void>> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  try {
    await prismaClient.$transaction([
      prismaClient.websiteTick.deleteMany({
        where: {
          websiteId: { in: ids },
        },
      }),

      prismaClient.uptimeHistory.deleteMany({
        where: {
          websiteId: { in: ids },
        },
      }),

      prismaClient.notificationConfig.deleteMany({
        where: {
          websiteId: { in: ids },
        },
      }),

      prismaClient.website.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
      }),
    ]);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete website:', error);
    return {
      success: false,
      message: 'Failed to delete website',
    };
  }
}

export async function hasActiveValidators(): Promise<Response<boolean>> {
  try {
    const validators = await prismaClient.validator.findMany({
      where: {
        isActive: true,
      },
    });

    return {
      success: true,
      data: validators.length > 0,
    };
  } catch (error) {
    console.error('Failed to check if there are active validators:', error);
    return {
      success: false,
      message: 'Failed to check if there are active validators',
    };
  }
}

export async function sendEmailTestAlert(
  websiteId: string
): Promise<Response<void>> {
  const user = await getUser();
  let alertCount = 0;
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const notificationConfig = await prismaClient.notificationConfig.findFirst({
    where: {
      userId: user.id,
      websiteId: websiteId,
    },
    include: {
      website: true,
      user: true,
    },
  });

  if (!notificationConfig) {
    return {
      success: false,
      message: 'Website not found',
    };
  }

  if (!notificationConfig.email) {
    return {
      success: false,
      message: 'Email is not set',
    };
  }

  if (notificationConfig.user.emailAlertQuota <= 0) {
    return {
      success: false,
      message: 'Email alert quota is out of limit',
    };
  }

  let existingQuota = notificationConfig.user.emailAlertQuota;

  if (notificationConfig.isDownAlertEnabled) {
    await sendWebsiteStatusEmail({
      to: notificationConfig.email,
      websiteUrl: notificationConfig.website.url,
      status: 'DOWN',
      timestamp: new Date().toLocaleString(),
      userId: user.id,
      websiteId,
    });
    alertCount++;
    existingQuota--;
  }

  if (existingQuota > 0 && notificationConfig.isHighPingAlertEnabled) {
    await sendWebsitePingAnomalyEmail({
      to: notificationConfig.email,
      websiteUrl: notificationConfig.website.url,
      region: 'US',
      currentPing: 100,
      averagePing: 50,
      timestamp: new Date().toLocaleString(),
      userId: user.id,
      websiteId,
    });
    alertCount++;
  }

  await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailAlertQuota: {
        decrement: alertCount,
      },
      // emailAlertReset: {
      //   set: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      // },
    },
  });

  return {
    success: true,
  };
}

export async function sendWebhookTestAlert(
  websiteId: string
): Promise<Response<void>> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const notificationConfig = await prismaClient.notificationConfig.findFirst({
    where: {
      userId: user.id,
      websiteId: websiteId,
    },
    include: {
      website: true,
    },
  });

  if (!notificationConfig) {
    return {
      success: false,
      message: 'Website not found',
    };
  }

  if (!notificationConfig.webhookUrl) {
    return {
      success: false,
      message: 'Webhook URL is not set',
    };
  }

  if (notificationConfig.isDownAlertEnabled) {
    await createAlert(
      notificationConfig.webhookUrl,
      JSON.stringify({
        event: 'website_down',
        websiteId: notificationConfig.website.id,
        timestamp: new Date(),
        details: {
          websiteUrl: notificationConfig.website.url,
          status: 'DOWN',
          region: notificationConfig.website.preferredRegion || 'US',
        },
      }),
      user.id,
      websiteId,
      WebsiteAlertType.WEBHOOK
    );
  }

  if (notificationConfig.isHighPingAlertEnabled) {
    await createAlert(
      notificationConfig.webhookUrl,
      JSON.stringify({
        event: 'high_ping',
        websiteId: notificationConfig.website.id,
        timestamp: new Date(),
        details: {
          websiteUrl: notificationConfig.website.url,
          region: notificationConfig.website.preferredRegion || 'US',
          currentPing: 100,
          averagePing: 50,
        },
      }),
      user.id,
      websiteId,
      WebsiteAlertType.WEBHOOK
    );
  }

  return {
    success: true,
  };
}
