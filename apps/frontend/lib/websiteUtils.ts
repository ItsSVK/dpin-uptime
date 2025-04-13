import { WebsiteStatus } from '@prisma/client';
import type { ProcessedWebsite } from '@/types/website';

interface RawWebsite {
  id: string;
  url: string;
  ticks: {
    id: string;
    websiteId: string;
    status: WebsiteStatus;
    createdAt: Date;
  }[];
}

export function processWebsiteData(website: RawWebsite): ProcessedWebsite {
  // Sort ticks by creation time
  const sortedTicks = [...website.ticks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get the most recent 30 minutes of ticks
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const recentTicks = sortedTicks.filter(
    tick => new Date(tick.createdAt) > thirtyMinutesAgo
  );

  // Aggregate ticks into 3-minute windows (10 windows total)
  const windows: WebsiteStatus[] = [];

  for (let i = 0; i < 10; i++) {
    const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
    const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);

    const windowTicks = recentTicks.filter(tick => {
      const tickTime = new Date(tick.createdAt);
      return tickTime >= windowStart && tickTime < windowEnd;
    });

    // Window is considered up if majority of ticks are up
    const upTicks = windowTicks.filter(
      tick => tick.status === WebsiteStatus.GOOD
    ).length;
    windows[9 - i] =
      windowTicks.length === 0
        ? WebsiteStatus.UNKNOWN
        : upTicks / windowTicks.length >= 0.5
          ? WebsiteStatus.GOOD
          : WebsiteStatus.BAD;
  }

  // Calculate overall status and uptime percentage
  const totalTicks = sortedTicks.length;
  const upTicks = sortedTicks.filter(
    tick => tick.status === WebsiteStatus.GOOD
  ).length;
  const uptimePercentage =
    totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

  // Get the most recent status
  const currentStatus = windows[windows.length - 1];

  // Format the last checked time
  const lastChecked = sortedTicks[0]
    ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
    : 'Never';

  return {
    id: website.id,
    url: website.url,
    status: currentStatus,
    uptimePercentage,
    lastChecked,
    uptimeTicks: windows,
  };
}
