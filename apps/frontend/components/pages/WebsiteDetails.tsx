'use client';

// export default function WebsiteDetails({ id }: { id: string }) {
//   return <div>WebsiteDetails {id}</div>;
// }

'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Settings,
  Send,
} from 'lucide-react';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Website } from '@/types/website';
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];
const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

async function getWebsite(id: string) {
  const website = await fetch(`/api/websites/${id}/status`);
  return website.json();
}

async function WebsiteDetails({ id }: { id: string }) {
  const [website, setWebsite] = useState<Website | null>(null);

  console.log(website);

  useEffect(() => {
    const fetchWebsite = async () => {
      const website = await getWebsite(id);
      setWebsite(website);
    };
    fetchWebsite();
  }, [id]);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: {
      time: string;
      nameLookup: number;
      connection: number;
      tlsHandshake: number;
      dataTransfer: number;
    };
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: {
      time: '',
      nameLookup: 0,
      connection: 0,
      tlsHandshake: 0,
      dataTransfer: 0,
    },
  });

  // Generate sample data for the graph
  const generateData = () => {
    return Array.from({ length: 96 }, (_, i) => {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      return {
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        nameLookup: Math.random() * 100 + 50,
        connection: Math.random() * 150 + 100,
        tlsHandshake: Math.random() * 200 + 150,
        dataTransfer: Math.random() * 250 + 200,
      };
    });
  };

  const data = generateData();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate data point index based on x position
    const index = Math.floor((x / rect.width) * data.length);
    const dataPoint = data[Math.min(Math.max(0, index), data.length - 1)];

    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      data: dataPoint,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-semibold">x.com</h1>
          <span className="text-green-400 text-sm">Up</span>
          <span className="text-gray-400 text-sm">
            · Checked every 3 minutes
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 mb-8">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Send size={18} />
            <span>Send test alert</span>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <AlertTriangle size={18} />
            <span>Incidents</span>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Pause size={18} />
            <span>Pause</span>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
            <span>Configure</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#232936] rounded-lg p-6">
            <div className="text-gray-400 mb-2">Currently up for</div>
            <div className="text-2xl font-semibold">
              13 hours 39 mins 29 seconds
            </div>
          </div>
          <div className="bg-[#232936] rounded-lg p-6">
            <div className="text-gray-400 mb-2">Last checked at</div>
            <div className="text-2xl font-semibold">53 seconds ago</div>
          </div>
          <div className="bg-[#232936] rounded-lg p-6">
            <div className="text-gray-400 mb-2">Incidents</div>
            <div className="text-2xl font-semibold">0</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Area Chart - Stacked</CardTitle>
            <CardDescription>
              Showing total visitors for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={value => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="mobile"
                  type="natural"
                  fill="var(--color-mobile)"
                  fillOpacity={0.4}
                  stroke="var(--color-mobile)"
                  stackId="a"
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="var(--color-desktop)"
                  fillOpacity={0.4}
                  stroke="var(--color-desktop)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{' '}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default WebsiteDetails;
