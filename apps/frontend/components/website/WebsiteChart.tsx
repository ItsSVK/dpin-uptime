'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';

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
import { WebsiteTick } from '@/types/website';

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  dataTransfer: {
    label: 'Data Transfer',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface WebsiteChartProps {
  data: WebsiteTick[];
}

export function WebsiteChart({ data }: WebsiteChartProps) {
  // get last 20 ticks
  data = data.slice(-20);

  return (
    <Card className="border-gray-700 rounded-2xl">
      <CardHeader>
        <CardTitle>Uptime</CardTitle>
        <CardDescription>
          Showing total uptime for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            {/* <CartesianGrid vertical={false} /> */}
            <XAxis
              dataKey="createdAt"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value =>
                new Date(value).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                })
              }
            />
            <YAxis
              dataKey="total"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="bg-white dark:bg-gray-900"
                />
              }
            />
            <Area
              dataKey="total"
              label="Total"
              type="natural"
              fill="var(--color-dataTransfer)"
              fillOpacity={0.4}
              stroke="var(--color-dataTransfer)"
              stackId="b"
            />
            <Area
              dataKey="dataTransfer"
              label="Data Transfer"
              type="natural"
              fill="var(--color-total)"
              fillOpacity={0.4}
              stroke="var(--color-total)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
