'use server';

import { Website, WebsiteTick } from '@/types/website';
import { prismaClient } from 'db/client';
import { auth } from '@clerk/nextjs/server';
import { formatUrl } from '@/lib/url';

export async function getWebsite(
  id: string
): Promise<Website & { ticks: WebsiteTick[] }> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const data = await prismaClient.website.findFirst({
    where: {
      id,
      userId,
      disabled: false,
    },
    include: {
      ticks: true,
    },
  });

  if (!data) {
    throw new Error('Website not found');
  }

  return data as unknown as Website & { ticks: WebsiteTick[] };
}

export async function getWebsites(): Promise<
  (Website & { ticks: WebsiteTick[] })[]
> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const data = await prismaClient.website.findMany({
    where: {
      userId,
      disabled: false,
    },
    include: {
      ticks: true,
    },
  });

  return data as unknown as (Website & { ticks: WebsiteTick[] })[];
}

export async function createWebsite(url: string): Promise<Website> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const data = await prismaClient.website.create({
    data: {
      url: formatUrl(url),
      userId,
    },
  });

  return data as unknown as Website;
}
