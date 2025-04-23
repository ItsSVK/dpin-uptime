import { AlertTriangle, Clock, Globe, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WebsiteListStatsProps {
  stats: {
    total: number;
    online: number;
    issues: number;
    avgUptime: number;
    avgResponse: number;
  };
}

export function WebsiteListStats({ stats }: WebsiteListStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Globe className="h-8 w-8 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Total Websites
              </p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Zap className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">Online</p>
              <p className="text-2xl font-bold text-white">{stats.online}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">Issues</p>
              <p className="text-2xl font-bold text-white">{stats.issues}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Avg. Response Time
              </p>
              <p className="text-2xl font-bold text-white">
                {stats.avgResponse
                  ? `${Math.round(stats.avgResponse)}ms`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
