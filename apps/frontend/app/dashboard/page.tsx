import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteListHeader } from '@/components/pages/website-list/website-list-header';
import { WebsiteListFilters } from '@/components/pages/website-list/website-list-filters';
import { WebsiteListTable } from '@/components/pages/website-list/website-list-table';
import { WebsiteListStats } from '@/components/pages/website-list/website-list-stats';
import { WebsiteListEmptyState } from '@/components/pages/website-list/website-list-empty-state';
import { WebsiteAddDialog } from '@/components/pages/website-list/website-add-dialog';

export default function WebsitesPage() {
  // In a real application, you would fetch the websites data
  // For this example, we'll use mock data
  const websites = [
    {
      id: '1',
      name: 'example.com',
      url: 'https://example.com',
      status: 'online',
      uptime: 99.98,
      responseTime: 187,
      lastChecked: '2 min ago',
      monitoringSince: 'Jan 15, 2023',
      checkFrequency: '60 seconds',
    },
    {
      id: '2',
      name: 'yoursite.com',
      url: 'https://yoursite.com',
      status: 'online',
      uptime: 100,
      responseTime: 142,
      lastChecked: '1 min ago',
      monitoringSince: 'Feb 3, 2023',
      checkFrequency: '60 seconds',
    },
    {
      id: '3',
      name: 'clientwebsite.org',
      url: 'https://clientwebsite.org',
      status: 'offline',
      uptime: 92.64,
      responseTime: 0,
      lastChecked: '3 min ago',
      monitoringSince: 'Mar 10, 2023',
      checkFrequency: '60 seconds',
    },
    {
      id: '4',
      name: 'api.service.com',
      url: 'https://api.service.com',
      status: 'online',
      uptime: 99.76,
      responseTime: 214,
      lastChecked: '2 min ago',
      monitoringSince: 'Dec 5, 2022',
      checkFrequency: '30 seconds',
    },
    {
      id: '5',
      name: 'dashboard.app',
      url: 'https://dashboard.app',
      status: 'online',
      uptime: 99.92,
      responseTime: 156,
      lastChecked: '1 min ago',
      monitoringSince: 'Jan 20, 2023',
      checkFrequency: '60 seconds',
    },
    {
      id: '6',
      name: 'staging.example.com',
      url: 'https://staging.example.com',
      status: 'degraded',
      uptime: 98.45,
      responseTime: 356,
      lastChecked: '5 min ago',
      monitoringSince: 'Feb 15, 2023',
      checkFrequency: '5 minutes',
    },
    {
      id: '7',
      name: 'dev.example.com',
      url: 'https://dev.example.com',
      status: 'online',
      uptime: 97.32,
      responseTime: 245,
      lastChecked: '10 min ago',
      monitoringSince: 'Mar 1, 2023',
      checkFrequency: '10 minutes',
    },
    {
      id: '8',
      name: 'store.example.com',
      url: 'https://store.example.com',
      status: 'online',
      uptime: 99.95,
      responseTime: 165,
      lastChecked: '2 min ago',
      monitoringSince: 'Nov 10, 2022',
      checkFrequency: '30 seconds',
    },
  ];

  // Check if there are any websites to display
  const hasWebsites = websites.length > 0;

  return (
    <div className="container space-y-6 p-8 pt-6 w-full max-w-screen-xl mx-auto">
      <WebsiteListHeader />

      {hasWebsites ? (
        <>
          <WebsiteListStats websites={websites} />
          <WebsiteListFilters />
          <WebsiteListTable websites={websites} />
        </>
      ) : (
        <WebsiteListEmptyState />
      )}

      <div className="fixed bottom-8 right-8">
        <WebsiteAddDialog>
          <Button
            size="lg"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle className="h-5 w-5" />
            Add Website
          </Button>
        </WebsiteAddDialog>
      </div>
    </div>
  );
}
