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
import { Region } from '@prisma/client';
import { startOfHour, subHours, format } from 'date-fns';

interface ResponseTimeChartProps {
  website: ProcessedWebsite;
}

export function ResponseTimeChart({ website }: ResponseTimeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  const [hoveredDot, setHoveredDot] = useState<null | {
    x: number;
    y: number;
    tick: (typeof website.ticks)[0];
    mouseX: number;
    mouseY: number;
  }>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Process ticks data for the selected time range
    const hours =
      timeRange === 'Last 24 hours'
        ? 24
        : timeRange === 'Last 7 days'
          ? 168
          : 720;

    const startDate = subHours(startOfHour(new Date()), hours);
    const ticks = website.ticks
      .filter(tick => new Date(tick.createdAt) >= startDate)
      .filter(tick => tick.total !== null)
      .filter(
        tick => selectedRegion === 'all' || tick.region === selectedRegion
      );

    // Group ticks by hour and calculate average response time
    const hourlyResponseTimes = new Array(hours).fill(0).map((_, index) => {
      const hour = subHours(new Date(), hours - 1 - index);
      const hourStart = startOfHour(hour);
      const hourEnd = subHours(startOfHour(hour), -1);

      const hourTicks = ticks.filter(tick => {
        const tickDate = new Date(tick.createdAt);
        return tickDate >= hourStart && tickDate < hourEnd;
      });

      if (hourTicks.length === 0) return null;

      const totalResponseTime = hourTicks.reduce(
        (sum, tick) => sum + (tick.total || 0),
        0
      );
      return totalResponseTime / hourTicks.length;
    });

    const labels = Array.from({ length: hours }, (_, i) => {
      const date = subHours(new Date(), hours - 1 - i);
      return format(date, 'HH:mm');
    });

    // Store dot coordinates and tick data for hover detection
    const dotPoints: { x: number; y: number; tick: (typeof ticks)[0] }[] = [];

    // Draw chart
    const drawChart = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Chart dimensions
      const chartWidth = canvas.width - 60;
      const chartHeight = canvas.height - 60;
      const validTimes = hourlyResponseTimes.filter(
        time => time !== null
      ) as number[];
      const maxValue = Math.max(...validTimes) * 1.1;
      const minValue = Math.min(...validTimes) * 0.9;

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

      // Draw line chart
      ctx.beginPath();
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 2;

      // Create gradient for area under the line
      const gradient = ctx.createLinearGradient(0, 20, 0, chartHeight + 20);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); // emerald-500 with opacity
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)'); // transparent

      // Draw points and connect them
      let firstValidPoint = true;
      hourlyResponseTimes.forEach((value, index) => {
        if (value === null) return;

        const x = 40 + (chartWidth / (hours - 1)) * index;
        const normalizedValue =
          ((value - minValue) / (maxValue - minValue)) * chartHeight;
        const y = chartHeight + 20 - normalizedValue;

        if (firstValidPoint) {
          ctx.moveTo(x, y);
          firstValidPoint = false;
        } else {
          ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = '#10b981'; // emerald-500
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Store dot info for hover detection
        const hourStart = startOfHour(subHours(new Date(), hours - 1 - index));
        const hourEnd = subHours(hourStart, -1);
        const hourTicks = ticks.filter(tick => {
          const tickDate = new Date(tick.createdAt);
          return tickDate >= hourStart && tickDate < hourEnd;
        });
        if (hourTicks.length > 0) {
          dotPoints.push({ x, y, tick: hourTicks[0] });
        }
      });

      // Stroke the line
      ctx.stroke();

      // Fill area under the line
      ctx.lineTo(chartWidth + 40, chartHeight + 20);
      ctx.lineTo(40, chartHeight + 20);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw x-axis labels
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < hours; i += Math.ceil(hours / 10)) {
        const x = 40 + (chartWidth / (hours - 1)) * i;
        ctx.fillText(labels[i], x, chartHeight + 35);
      }

      // Draw y-axis labels
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = minValue + ((maxValue - minValue) / 5) * (5 - i);
        const y = 20 + (chartHeight / 5) * i;
        ctx.fillText(`${Math.round(value)}ms`, 35, y + 3);
      }

      // Draw average line
      const avgResponseTime =
        validTimes.reduce((sum, value) => sum + value, 0) / validTimes.length;
      const avgY =
        chartHeight +
        20 -
        ((avgResponseTime - minValue) / (maxValue - minValue)) * chartHeight;

      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b'; // amber-500
      ctx.setLineDash([4, 4]);
      ctx.moveTo(40, avgY);
      ctx.lineTo(chartWidth + 40, avgY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for average
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Avg: ${Math.round(avgResponseTime)}ms`, 45, avgY - 5);
    };

    drawChart();

    // Mouse event handlers for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const radius = 6; // px
      for (const point of dotPoints) {
        if (
          Math.abs(mouseX - point.x) < radius &&
          Math.abs(mouseY - point.y) < radius
        ) {
          setHoveredDot({ ...point, mouseX, mouseY });
          return;
        }
      }
      setHoveredDot(null);
    };
    const handleMouseLeave = () => setHoveredDot(null);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawChart();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
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
          <CardTitle>Response Time</CardTitle>
          <CardDescription>
            Response time measurements over time
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          <canvas ref={canvasRef} className="h-full w-full" />
          {hoveredDot && (
            <div
              style={{
                position: 'absolute',
                left: hoveredDot.mouseX + 10,
                top: hoveredDot.mouseY + 10,
                pointerEvents: 'none',
                zIndex: 10,
                background: '#18181b',
                color: '#fff',
                border: '1px solid #27272a',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                minWidth: 120,
                maxWidth: 220,
                whiteSpace: 'normal',
              }}
            >
              <div>
                <strong>
                  {format(new Date(hoveredDot.tick.createdAt), 'PPpp')}
                </strong>
              </div>
              <div>Ping: {hoveredDot.tick.total} ms</div>
              <div>Region: {hoveredDot.tick.region}</div>
              {/* Add more details as needed */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
