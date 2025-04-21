'use server';

import { Website, WebsiteTick } from '@/types/website';
import { prismaClient } from 'db/client';
import { formatUrl } from '@/lib/url';
import { getUserFromJWT } from '@/lib/auth';

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
      disabled: false,
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
      disabled: false,
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

export async function createWebsite(url: string): Promise<Response<Website>> {
  const user = await getUserFromJWT();
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const data = await prismaClient.website.create({
    data: {
      url: formatUrl(url),
      userId: user.walletAddress,
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
