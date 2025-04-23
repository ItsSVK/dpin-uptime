'use client';
import { ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebsiteHeader } from '@/components/pages/website/website-header';
import { WebsiteOverview } from '@/components/pages/website/website-overview';
import { UptimeHistoryChart } from '@/components/pages/website/uptime-history-chart';
import { ResponseTimeChart } from '@/components/pages/website/response-time-chart';
import { useState } from 'react';

export default function DashboardDetailPage({ id }: { id: string }) {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    slack: true,
    webhook: false,
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // In a real application, you would fetch the website data based on the ID
  // For this example, we'll use mock data
  const website = {
    id: id,
    name: 'example.com',
    url: 'https://example.com',
    status: 'online',
    uptime: {
      day: 99.98,
      week: 99.95,
      month: 99.92,
      year: 99.87,
    },
    responseTime: {
      current: 187,
      average: {
        day: 192,
        week: 198,
        month: 205,
      },
    },
    lastChecked: '2 minutes ago',
    monitoringSince: 'Jan 15, 2023',
    checkFrequency: '60 seconds',
  };

  return (
    <div className="container space-y-6 p-8 pt-6 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{website.name}</h1>
          <Button variant="ghost" size="icon" asChild>
            <a href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Visit website</span>
            </a>
          </Button>
        </div>
      </div>

      <WebsiteHeader website={website} />

      <WebsiteOverview website={website} />

      <Tabs defaultValue="uptime" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-zinc-800 p-1 rounded-md h-10">
          <TabsTrigger
            value="uptime"
            className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white rounded-sm"
          >
            Uptime
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white rounded-sm"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white rounded-sm"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="uptime" className="space-y-4 pt-4">
          <div className="grid gap-12">
            <UptimeHistoryChart />
          </div>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4 pt-4">
          <div className="grid gap-12">
            <ResponseTimeChart />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure who gets notified when issues occur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Globe className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-zinc-400">
                        john@example.com, team@example.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Globe className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">SMS Notifications</h3>
                      <p className="text-sm text-zinc-400">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Globe className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Slack Integration</h3>
                      <p className="text-sm text-zinc-400">
                        #monitoring-alerts channel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.slack}
                        onChange={() => handleNotificationChange('slack')}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Globe className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Webhook</h3>
                      <p className="text-sm text-zinc-400">
                        https://example.com/webhook
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.webhook}
                        onChange={() => handleNotificationChange('webhook')}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
