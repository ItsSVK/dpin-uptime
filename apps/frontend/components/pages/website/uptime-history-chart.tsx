'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProcessedWebsite } from '@/types/website';
import { WebsiteStatus, Region } from '@prisma/client';
import { startOfDay, subDays, format } from 'date-fns';

interface UptimeHistoryChartProps {
  website: ProcessedWebsite;
}

export function UptimeHistoryChart({ website }: UptimeHistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Process ticks data for the selected time range
    const days =
      timeRange === 'Last 24 hours'
        ? 1
        : timeRange === 'Last 7 days'
          ? 7
          : timeRange === 'Last 30 days'
            ? 30
            : 90;

    const startDate = subDays(startOfDay(new Date()), days);
    const ticks = website.ticks
      .filter(tick => new Date(tick.createdAt) >= startDate)
      .filter(
        tick => selectedRegion === 'all' || tick.region === selectedRegion
      );

    // Group ticks by day and calculate uptime percentage
    const dailyUptime = new Array(days).fill(0).map((_, index) => {
      const day = subDays(new Date(), days - 1 - index);
      const dayStart = startOfDay(day);
      const dayEnd = subDays(startOfDay(day), -1);

      const dayTicks = ticks.filter(tick => {
        const tickDate = new Date(tick.createdAt);
        return tickDate >= dayStart && tickDate < dayEnd;
      });

      if (dayTicks.length === 0) return 100; // Assume 100% if no data

      const upTicks = dayTicks.filter(
        tick => tick.status === WebsiteStatus.ONLINE
      ).length;
      return (upTicks / dayTicks.length) * 100;
    });

    const labels = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return format(date, 'MMM d');
    });

    // Draw chart
    const drawChart = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Chart dimensions
      const chartWidth = canvas.width - 60;
      const chartHeight = canvas.height - 60;
      const barWidth = Math.max(1, chartWidth / days - 1);
      const barSpacing = 1;
      const maxValue = 100;
      const minValue = Math.min(...dailyUptime) - 0.5;

      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#3f3f46'; // zinc-700
      ctx.moveTo(40, 20);
      ctx.lineTo(40, chartHeight + 20);
      ctx.lineTo(chartWidth + 40, chartHeight + 20);
      ctx.stroke();

      // Draw horizontal grid lines
      ctx.beginPath();
      ctx.strokeStyle = '#27272a'; // zinc-800
      ctx.setLineDash([2, 2]);
      for (let i = 0; i <= 5; i++) {
        const y = 20 + (chartHeight / 5) * i;
        ctx.moveTo(40, y);
        ctx.lineTo(chartWidth + 40, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw bars
      dailyUptime.forEach((value, index) => {
        const x = 40 + index * (barWidth + barSpacing);
        const normalizedValue =
          ((value - minValue) / (maxValue - minValue)) * chartHeight;
        const barHeight = normalizedValue;
        const y = chartHeight + 20 - barHeight;

        // Determine color based on uptime value
        let color;
        if (value >= 99.9) {
          color = '#10b981'; // emerald-500
        } else if (value >= 99.5) {
          color = '#f59e0b'; // amber-500
        } else {
          color = '#ef4444'; // red-500
        }

        // Draw bar
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Draw label (only every few bars to avoid crowding)
        if (index % Math.ceil(days / 10) === 0) {
          ctx.fillStyle = '#a1a1aa'; // zinc-400
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(labels[index], x + barWidth / 2, chartHeight + 35);
        }
      });

      // Draw y-axis labels
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = minValue + ((maxValue - minValue) / 5) * (5 - i);
        const y = 20 + (chartHeight / 5) * i;
        ctx.fillText(`${value.toFixed(1)}%`, 35, y + 3);
      }

      // Find and draw incidents (downtime periods)
      const incidents = ticks
        .filter(tick => tick.status === WebsiteStatus.OFFLINE)
        .map(tick => {
          const tickDate = new Date(tick.createdAt);
          const dayIndex =
            days -
            1 -
            Math.floor(
              (new Date().getTime() - tickDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
          return { day: dayIndex, duration: 'N/A' };
        });

      incidents.forEach(incident => {
        if (incident.day < 0 || incident.day >= days) return;

        const x = 40 + incident.day * (barWidth + barSpacing) + barWidth / 2;

        // Draw marker
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.beginPath();
        ctx.arc(x, 15, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw line to bar
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444'; // red-500
        ctx.setLineDash([2, 2]);
        ctx.moveTo(x, 15);
        ctx.lineTo(
          x,
          chartHeight +
            20 -
            ((dailyUptime[incident.day] - minValue) / (maxValue - minValue)) *
              chartHeight
        );
        ctx.stroke();
        ctx.setLineDash([]);
      });
    };

    drawChart();

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [timeRange, website.ticks, selectedRegion]);

  // Get unique regions from ticks
  const availableRegions = Array.from(
    new Set(website.ticks.map(tick => tick.region))
  );

  return (
    <Card className="border-zinc-800 bg-zinc-950 min-h-[500px]">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Uptime History</CardTitle>
          <CardDescription>
            Historical uptime percentage for this website
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-zinc-800 bg-zinc-950 text-xs"
              >
                <Globe className="h-3.5 w-3.5" />
                {selectedRegion === 'all' ? 'All Regions' : selectedRegion}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-zinc-800 bg-zinc-950"
            >
              <DropdownMenuItem onClick={() => setSelectedRegion('all')}>
                All Regions
              </DropdownMenuItem>
              {availableRegions.map(region => (
                <DropdownMenuItem
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-zinc-800 bg-zinc-950 text-xs"
              >
                {timeRange}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-zinc-800 bg-zinc-950"
            >
              <DropdownMenuItem onClick={() => setTimeRange('Last 24 hours')}>
                Last 24 hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('Last 7 days')}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('Last 30 days')}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('Last 90 days')}>
                Last 90 days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
            <span className="text-xs text-zinc-400">99.9% - 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-amber-500"></div>
            <span className="text-xs text-zinc-400">99.5% - 99.9%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500"></div>
            <span className="text-xs text-zinc-400">&lt; 99.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500"></div>
            <span className="text-xs text-zinc-400">Incident</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
