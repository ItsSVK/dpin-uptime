'use server';

import { Website, WebsiteTick } from '@/types/website';
import { prismaClient } from '../../../packages/db/prisma/migrations/src';
import { formatUrl } from '@/lib/url';
import { getUserFromJWT } from '@/lib/auth';
import { WebsiteStatus } from '@prisma/client';
import { getUserBalance } from '@/actions/deposit';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function getWebsite(
  id: string
): Promise<Response<Website & { ticks: WebsiteTick[] }>> {
  const user = await getUserFromJWT();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const data = await prismaClient.website.findFirst({
    where: {
      id,
      userId: user.userId,
    },
    include: {
      ticks: {
        orderBy: {
          createdAt: 'asc',
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
    data,
  };
}

export async function getWebsites(): Promise<
  Response<(Website & { ticks: WebsiteTick[] })[]>
> {
  const user = await getUserFromJWT();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const data = await prismaClient.website.findMany({
    where: {
      userId: user.userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      ticks: true,
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
  checkFrequency: number
): Promise<Response<Website>> {
  const user = await getUserFromJWT();
  const userBalance = await getUserBalance();
  if (!user || !userBalance.success) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  if (userBalance.balance && userBalance.balance < 0.1 * LAMPORTS_PER_SOL) {
    return {
      success: false,
      message: 'Insufficient balance',
    };
  }
  const formattedUrl = formatUrl(url);
  const name = urlName || new URL(formattedUrl).hostname;

  const data = await prismaClient.website.create({
    data: {
      url: formattedUrl,
      name,
      userId: user.userId,
      status: WebsiteStatus.UNKNOWN,
      checkFrequency,
      uptimePercentage: 100,
      monitoringSince: new Date(),
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
  const user = await getUserFromJWT();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const userBalance = await getUserBalance();
  if (!userBalance.success) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  if (userBalance.balance && userBalance.balance < 0.1 * LAMPORTS_PER_SOL) {
    return {
      success: false,
      message: 'Add more SOL to your balance to continue monitoring',
    };
  }

  const updatedData = await prismaClient.website.update({
    where: {
      id,
      userId: user.userId,
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
  const user = await getUserFromJWT();
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

      prismaClient.website.deleteMany({
        where: {
          id: { in: ids },
          userId: user.userId,
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
