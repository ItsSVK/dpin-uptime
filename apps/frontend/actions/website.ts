'use server';

import { Website, WebsiteTick } from '@/types/website';
import { prismaClient } from 'db/client';
import { formatUrl } from '@/lib/url';
import { getUserFromJWT } from '@/lib/auth';
import { WebsiteStatus } from '@prisma/client';

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
      userId: user.walletAddress,
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
      userId: user.walletAddress,
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
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const formattedUrl = formatUrl(url);
  const name = urlName || new URL(formattedUrl).hostname;

  const data = await prismaClient.website.create({
    data: {
      url: formattedUrl,
      name,
      userId: user.walletAddress,
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

  const updatedData = await prismaClient.website.update({
    where: {
      id,
      userId: user.walletAddress,
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
          userId: user.walletAddress,
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
