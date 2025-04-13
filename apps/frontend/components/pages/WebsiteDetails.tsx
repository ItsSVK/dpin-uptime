'use client';
import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Settings,
  Send,
} from 'lucide-react';

import { WebsiteChart } from '@/components/website/WebsiteChart';
import { Website } from '@prisma/client';
interface WebsiteDetailsProps {
  id: string;
  initialData: Website;
}

function WebsiteDetails({ id, initialData }: WebsiteDetailsProps) {
  const [website] = useState<Website>(initialData);

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-semibold">
            {website?.url || 'Loading...'}
          </h1>
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

        <WebsiteChart />
      </div>
    </div>
  );
}

export default WebsiteDetails;
