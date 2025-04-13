import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prismaClient } from 'db/client';
import { formatUrl } from '@/lib/url';

export async function GET(req: NextRequest) {
  return withAuth(req, async userId => {
    const websites = await prismaClient.website.findMany({
      where: {
        userId,
        disabled: false,
      },
      include: {
        ticks: true,
      },
    });

    return NextResponse.json({ websites });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async userId => {
    const { url } = await req.json();
    const formattedUrl = formatUrl(url);

    // Check if the website is already monitored
    let website = await prismaClient.website.findFirst({
      where: {
        url: formattedUrl,
        userId,
      },
    });

    if (!website) {
      website = await prismaClient.website.create({
        data: {
          userId,
          url: formattedUrl,
        },
      });
    }

    return NextResponse.json({ id: website.id });
  });
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async userId => {
    const { websiteId } = await req.json();

    await prismaClient.website.update({
      where: {
        id: websiteId,
        userId,
      },
      data: {
        disabled: true,
      },
    });

    return NextResponse.json({ message: 'Deleted website successfully' });
  });
}
