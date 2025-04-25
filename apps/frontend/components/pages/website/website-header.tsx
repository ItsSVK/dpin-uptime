import { Check, Clock, Globe, X, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessedWebsite } from '@/types/website';
import { WebsiteStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface WebsiteHeaderProps {
  website: ProcessedWebsite;
}

export function WebsiteHeader({ website }: WebsiteHeaderProps) {
  const uptimeStats = {
    day: website.uptimePercentage,
    week: website.uptimePercentage, // We'll need to add this to the backend
    month: website.uptimePercentage, // We'll need to add this to the backend
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
            <Globe className="h-6 w-6 text-zinc-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{website.url}</h2>

              {(() => {
                switch (website.status) {
                  case WebsiteStatus.ONLINE:
                  case WebsiteStatus.DEGRADED:
                    return (
                      <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
                        <Check className="mr-1 h-3 w-3" />
                        Online
                      </Badge>
                    );
                  case WebsiteStatus.OFFLINE:
                    return (
                      <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                        <X className="mr-1 h-3 w-3" />
                        Offline
                      </Badge>
                    );
                  default:
                    return (
                      <Badge className="bg-zinc-500/20 text-zinc-500 hover:bg-zinc-500/30">
                        <Circle className="mr-1 h-3 w-3" />
                        Unknown
                      </Badge>
                    );
                }
              })()}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Last checked {website.lastChecked}</span>
              </div>
              <div>
                Monitoring since{' '}
                {formatDistanceToNow(new Date(website.monitoringSince))} ago
              </div>
              <div>Check frequency: {website.checkFrequency} seconds</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-24 flex-col items-center rounded-md border border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-400">24h Uptime</span>
            <span className="text-lg font-semibold">
              {uptimeStats.day.toFixed(2)}%
            </span>
          </div>
          <div className="flex min-w-24 flex-col items-center rounded-md border border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-400">7d Uptime</span>
            <span className="text-lg font-semibold">
              {uptimeStats.week.toFixed(2)}%
            </span>
          </div>
          <div className="flex min-w-24 flex-col items-center rounded-md border border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-400">30d Uptime</span>
            <span className="text-lg font-semibold">
              {uptimeStats.month.toFixed(2)}%
            </span>
          </div>
          <div className="flex min-w-24 flex-col items-center rounded-md border border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-400">Response</span>
            <span className="text-lg font-semibold">
              {website.responseTime?.toFixed(0) ?? 'N/A'}ms
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
