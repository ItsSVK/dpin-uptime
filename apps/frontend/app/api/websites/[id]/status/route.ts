import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prismaClient } from 'db/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async userId => {
    const { id } = await params;

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
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  });
}
