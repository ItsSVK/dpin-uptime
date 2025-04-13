'use client';

import { useState, useMemo } from 'react';
import { Globe, Plus, Moon, Sun } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import { useDarkMode } from '@/hooks/useDarkMode';
import { WebsiteCard } from '@/components/website/WebsiteCard';
import { CreateWebsiteModal } from '@/components/modals/CreateWebsiteModal';
import { processWebsiteData } from '@/lib/websiteUtils';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { websites, refreshWebsites } = useWebsites();
  const { getToken } = useAuth();

  const processedWebsites = useMemo(
    () => websites.map(processWebsiteData),
    [websites]
  );

  const handleAddWebsite = async (url: string | null) => {
    if (!url) {
      setIsModalOpen(false);
      return;
    }

    try {
      const token = await getToken();
      await axios.post(
        `${API_BACKEND_URL}/api/v1/website`,
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      refreshWebsites();
    } catch (error) {
      console.error('Failed to add website:', error);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Uptime Monitor
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processedWebsites.map(website => (
            <WebsiteCard key={website.id} website={website} />
          ))}
          {processedWebsites.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No websites added yet. Click "Add Website" to get started.
            </div>
          )}
        </div>
      </div>

      <CreateWebsiteModal isOpen={isModalOpen} onClose={handleAddWebsite} />
    </div>
  );
}
