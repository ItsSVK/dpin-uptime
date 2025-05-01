import { Website, WebsiteStatus, WebsiteTick } from '@prisma/client';
import type { ProcessedWebsite } from '@/types/website';

export function processWebsiteData(
  website: Website & {
    ticks: WebsiteTick[];
  }
): ProcessedWebsite {
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
      tick => tick.status === WebsiteStatus.ONLINE
    ).length;

    if (windowTicks.length === 0) {
      windows[9 - i] = WebsiteStatus.UNKNOWN;
    } else {
      const upRatio = upTicks / windowTicks.length;
      if (upRatio >= 0.8) {
        windows[9 - i] = WebsiteStatus.ONLINE;
      } else if (upRatio >= 0.5) {
        windows[9 - i] = WebsiteStatus.DEGRADED;
      } else {
        windows[9 - i] = WebsiteStatus.OFFLINE;
      }
    }
  }

  // Calculate average response time from recent ticks
  const validResponseTimes = recentTicks
    .filter(tick => tick.total != null)
    .map(tick => tick.total!);
  const averageResponse =
    validResponseTimes.length > 0
      ? validResponseTimes.reduce((a, b) => a + b, 0) /
        validResponseTimes.length
      : null;

  // Get the most recent status
  const currentStatus = sortedTicks[0]?.status || WebsiteStatus.UNKNOWN;

  // Format the last checked time
  const lastChecked = sortedTicks[0]
    ? timeSince(new Date(sortedTicks[0].createdAt))
    : 'Never';

  return {
    ...website,
    status: currentStatus,
    responseTime: averageResponse,
    lastChecked,
    uptimeTicks: windows,
    ticks: sortedTicks,
  };
}

export function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' mins ago';
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

export const publicRoutes = ['/sign', '/', '/payout', '/validator'];
