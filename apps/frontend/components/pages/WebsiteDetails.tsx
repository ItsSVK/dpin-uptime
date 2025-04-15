'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Pause, Settings, Send, Play } from 'lucide-react';

import { WebsiteChart } from '@/components/website/WebsiteChart';
import { Website, WebsiteStatus, WebsiteTick } from '@prisma/client';
import { timeSince } from '@/lib/websiteUtils';
import { pusherClient } from '@dpin/pusher';
import { getWebsite, updateWebsite } from '@/actions/website';
import { Card } from '@/components/ui/card';
interface WebsiteDetailsProps {
  id: string;
  initialWebsite: Website & { ticks: WebsiteTick[] };
}

function isServerDown(website: Website & { ticks: WebsiteTick[] }) {
  return website.ticks[website.ticks.length - 1]?.status === WebsiteStatus.BAD;
}

function WebsiteDetails({ id, initialWebsite }: WebsiteDetailsProps) {
  const [website, setWebsite] = useState<Website & { ticks: WebsiteTick[] }>(
    initialWebsite
  );

  useEffect(() => {
    pusherClient.subscribe('UPDATED_WEBSITE');
    pusherClient.bind('website-updated', (updatedId: string) => {
      console.log('website-updated', updatedId);
      if (updatedId === id) {
        getWebsite(id).then(setWebsite);
      }
    });

    return () => {
      pusherClient.unsubscribe('UPDATED_WEBSITE');
      pusherClient.unbind('website-updated');
    };
  }, [id]);

  const [uptime, setUptime] = useState<string>('N/A');
  const [lastCheckedAt, setLastCheckedAt] = useState<string>('N/A');

  useEffect(() => {
    if (!website || !website.upSince) return;

    const updateTimer = () => {
      setUptime(timeSince(website.upSince!.toString()));
      setLastCheckedAt(timeSince(website.lastCheckedAt!.toString()));
    };
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [website]);

  const handlePause = () => {
    updateWebsite(id, { isPaused: !website.isPaused }).then(setWebsite);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${
              website.isPaused
                ? 'bg-yellow-400'
                : isServerDown(website)
                  ? 'bg-red-400'
                  : 'bg-green-400'
            }`}
          ></div>
          <h1 className="text-2xl font-semibold">
            {website?.url || 'Loading...'}
          </h1>
          <span
            className={`text-sm ${
              website.isPaused
                ? 'text-yellow-400'
                : isServerDown(website)
                  ? 'text-red-400'
                  : 'text-green-400'
            }`}
          >
            {website.isPaused
              ? 'Paused'
              : isServerDown(website)
                ? 'Down'
                : 'Up'}
          </span>
          <span className="text-gray-400 text-sm">
            · Checked every {website?.checkFrequency} minutes
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
          <button
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            onClick={handlePause}
          >
            <>
              {website.isPaused ? (
                <div className="text-green-400 hover:text-green-300 flex items-center gap-2">
                  <Play size={18} />
                  <span>Resume</span>
                </div>
              ) : (
                <div className="text-red-400 hover:text-red-300 flex items-center gap-2">
                  <Pause size={18} />
                  <span>Pause</span>
                </div>
              )}
            </>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
            <span>Configure</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-[#232936] p-4 border-gray-700 rounded-2xl">
            <div className="text-gray-400 mb-1">Currently up for</div>
            <div
              className={`text-2xl font-semibold ${
                website.isPaused
                  ? 'text-gray-400'
                  : isServerDown(website)
                    ? 'text-red-400'
                    : 'text-white-400'
              }`}
            >
              {website.isPaused
                ? 'Paused'
                : isServerDown(website)
                  ? 'Down'
                  : uptime}
            </div>
          </Card>
          <Card className="bg-[#232936] p-4 border-gray-700 rounded-2xl">
            <div className="text-gray-400 mb-1">Last checked at</div>
            <div
              className={`text-2xl font-semibold ${
                website.isPaused ? 'text-gray-400' : 'text-white-400'
              }`}
            >
              {website.isPaused ? 'Paused' : lastCheckedAt}
            </div>
          </Card>
          {/* <Card className="bg-[#232936] p-4 border-gray-700 rounded-2xl">
            <div className="text-gray-400 mb-1">Incidents</div>
            <div className="text-2xl font-semibold">0</div>
          </Card> */}
        </div>

        <WebsiteChart data={website.ticks || []} />
      </div>
    </div>
  );
}

export default WebsiteDetails;
