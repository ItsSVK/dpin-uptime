import { ArrowDown, ArrowUp, Clock, Globe, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessedWebsite } from '@/types/website';
import { WebsiteStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface WebsiteOverviewProps {
  website: ProcessedWebsite;
}

export function WebsiteOverview({ website }: WebsiteOverviewProps) {
  // Calculate response time trend
  const recentTicks = website.ticks.slice(0, 10); // Get last 10 ticks
  const currentResponseTime = website.responseTime ?? 0;
  const previousResponseTimes = recentTicks
    .filter(tick => tick.total !== null)
    .map(tick => tick.total!);
  const avgPreviousResponse =
    previousResponseTimes.length > 0
      ? previousResponseTimes.reduce((a, b) => a + b, 0) /
        previousResponseTimes.length
      : 0;

  const responseTrend =
    currentResponseTime < avgPreviousResponse ? 'down' : 'up';
  const responseTrendValue =
    avgPreviousResponse === 0
      ? 0
      : Math.abs(
          Math.round(
            ((currentResponseTime - avgPreviousResponse) /
              avgPreviousResponse) *
              100
          )
        );

  // Find last downtime
  const lastDowntime = website.ticks.find(
    tick => tick.status === WebsiteStatus.OFFLINE
  );
  const lastDowntimeDate = lastDowntime
    ? new Date(lastDowntime.createdAt)
    : null;

  const metrics = [
    {
      title: 'Current Status',
      value:
        website.status === WebsiteStatus.ONLINE || WebsiteStatus.DEGRADED
          ? 'Online'
          : (() => {
              switch (website.status) {
                case WebsiteStatus.OFFLINE:
                  return 'Offline';
                case WebsiteStatus.UNKNOWN:
                  return 'Unknown';
                default:
                  return 'Unknown';
              }
            })(),
      icon: Globe,
      color:
        website.status === WebsiteStatus.ONLINE ||
        website.status === WebsiteStatus.DEGRADED
          ? 'text-emerald-500'
          : website.status === WebsiteStatus.OFFLINE
            ? 'text-red-500'
            : 'text-zinc-400',
      bgColor:
        website.status === WebsiteStatus.ONLINE ||
        website.status === WebsiteStatus.DEGRADED
          ? 'bg-emerald-500/10'
          : website.status === WebsiteStatus.OFFLINE
            ? 'bg-red-500/10'
            : 'bg-zinc-500/10',
    },
    {
      title: 'Response Time',
      value: website.responseTime
        ? `${Math.round(website.responseTime)}ms`
        : 'N/A',
      description: `Avg: ${Math.round(avgPreviousResponse)}ms recently`,
      icon: Zap,
      trend: responseTrend,
      trendValue: `${responseTrendValue}%`,
      color:
        website.status === WebsiteStatus.ONLINE
          ? 'text-emerald-500'
          : website.status === WebsiteStatus.DEGRADED
            ? 'text-amber-500'
            : website.status === WebsiteStatus.OFFLINE
              ? 'text-red-500'
              : 'text-zinc-400',
      bgColor:
        website.status === WebsiteStatus.ONLINE
          ? 'bg-emerald-500/10'
          : website.status === WebsiteStatus.DEGRADED
            ? 'bg-amber-500/10'
            : website.status === WebsiteStatus.OFFLINE
              ? 'bg-red-500/10'
              : 'bg-zinc-500/10',
    },
    {
      title: 'Uptime (30 days)',
      value: `${website.uptimePercentage.toFixed(2)}%`,
      description: `${Math.round((30 * 24 * 60 * (100 - website.uptimePercentage)) / 100)} minutes downtime`,
      icon:
        website.uptimePercentage >= 99.9
          ? ArrowUp
          : website.uptimePercentage >= 99
            ? ArrowDown
            : Clock,
      color:
        website.uptimePercentage >= 99.9
          ? 'text-emerald-500'
          : website.uptimePercentage >= 99
            ? 'text-amber-500'
            : 'text-red-500',
      bgColor:
        website.uptimePercentage >= 99.9
          ? 'bg-emerald-500/10'
          : website.uptimePercentage >= 99
            ? 'bg-amber-500/10'
            : 'bg-red-500/10',
    },
    // {
    //   title: 'SSL Certificate',
    //   value: 'Valid', // This would need to be added to the backend
    //   description: 'Expires in 45 days', // This would need to be added to the backend
    //   icon: Shield,
    //   color:
    //     website.status === WebsiteStatus.ONLINE ||
    //     website.status === WebsiteStatus.DEGRADED
    //       ? 'text-emerald-500'
    //       : 'text-zinc-400',
    //   bgColor:
    //     website.status === WebsiteStatus.ONLINE ||
    //     website.status === WebsiteStatus.DEGRADED
    //       ? 'bg-emerald-500/10'
    //       : website.status === WebsiteStatus.OFFLINE
    //         ? 'bg-red-500/10'
    //         : 'bg-zinc-500/10',
    // },
    {
      title: 'Last Downtime',
      value: lastDowntimeDate
        ? formatDistanceToNow(lastDowntimeDate, { addSuffix: true })
        : 'Never',
      description: lastDowntime ? 'Duration: Unknown' : undefined, // We'd need to calculate duration from ticks
      icon: Clock,
      color:
        website.status === WebsiteStatus.ONLINE ||
        website.status === WebsiteStatus.DEGRADED
          ? 'text-emerald-500'
          : 'text-zinc-400',
      bgColor:
        website.status === WebsiteStatus.ONLINE ||
        website.status === WebsiteStatus.DEGRADED
          ? 'bg-emerald-500/10'
          : website.status === WebsiteStatus.OFFLINE
            ? 'bg-red-500/10'
            : 'bg-zinc-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">
                {metric.title}
              </span>
              <div className={`${metric.bgColor} rounded-full p-1`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <p className="mt-1 text-xs text-zinc-500">{metric.description}</p>
            )}
            {metric.trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend === 'down' ? (
                  <ArrowDown className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    metric.trend === 'down'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }
                >
                  {metric.trendValue}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
