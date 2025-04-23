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
  return website.status === WebsiteStatus.OFFLINE;
}

function WebsiteDetails({ id, initialWebsite }: WebsiteDetailsProps) {
  const [website, setWebsite] = useState<Website & { ticks: WebsiteTick[] }>(
    initialWebsite
  );

  useEffect(() => {
    pusherClient.subscribe('UPDATED_WEBSITE');
    pusherClient.bind('website-updated', async (updatedId: string) => {
      if (updatedId === id) {
        const response = await getWebsite(id);
        if (response.success && response.data) {
          setWebsite(response.data);
        }
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
      if (website.upSince) {
        setUptime(timeSince(new Date(website.upSince)));
      }
      if (website.lastCheckedAt) {
        setLastCheckedAt(timeSince(new Date(website.lastCheckedAt)));
      }
    };
    updateTimer(); // Call immediately
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [website]);

  const handlePause = async () => {
    const response = await updateWebsite(id, { isPaused: !website.isPaused });
    if (response.success && response.data) {
      setWebsite(response.data);
    }
  };

  const getStatusColor = () => {
    if (website.isPaused) return 'text-yellow-400';
    switch (website.status) {
      case WebsiteStatus.ONLINE:
        return 'text-green-400';
      case WebsiteStatus.OFFLINE:
        return 'text-red-400';
      case WebsiteStatus.DEGRADED:
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusDot = () => {
    if (website.isPaused) return 'bg-yellow-400';
    switch (website.status) {
      case WebsiteStatus.ONLINE:
        return 'bg-green-400';
      case WebsiteStatus.OFFLINE:
        return 'bg-red-400';
      case WebsiteStatus.DEGRADED:
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    if (website.isPaused) return 'Paused';
    switch (website.status) {
      case WebsiteStatus.ONLINE:
        return 'Up';
      case WebsiteStatus.OFFLINE:
        return 'Down';
      case WebsiteStatus.DEGRADED:
        return 'Degraded';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`}></div>
          <h1 className="text-2xl font-semibold">
            {website.name || website.url}
          </h1>
          <span className={getStatusColor()}>{getStatusText()}</span>
          <span className="text-gray-400 text-sm">
            · Checked every {Math.round(website.checkFrequency / 60)} minutes
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
            <div className={`text-2xl font-semibold ${getStatusColor()}`}>
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
          <Card className="bg-[#232936] p-4 border-gray-700 rounded-2xl">
            <div className="text-gray-400 mb-1">Uptime</div>
            <div
              className={`text-2xl font-semibold ${
                website.uptimePercentage >= 99.9
                  ? 'text-green-400'
                  : website.uptimePercentage >= 99
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {website.uptimePercentage.toFixed(2)}%
            </div>
          </Card>
          <Card className="bg-[#232936] p-4 border-gray-700 rounded-2xl">
            <div className="text-gray-400 mb-1">Average Response Time</div>
            <div
              className={`text-2xl font-semibold ${
                website.averageResponse
                  ? website.averageResponse < 200
                    ? 'text-green-400'
                    : website.averageResponse < 500
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {website.averageResponse
                ? `${Math.round(website.averageResponse)}ms`
                : 'N/A'}
            </div>
          </Card>
        </div>

        <WebsiteChart data={website.ticks || []} />
      </div>
    </div>
  );
}

export default WebsiteDetails;
