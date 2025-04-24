'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteListHeader } from '@/components/pages/website-list/website-list-header';
import { WebsiteListFilters } from '@/components/pages/website-list/website-list-filters';
import { WebsiteListTable } from '@/components/pages/website-list/website-list-table';
import { WebsiteListStats } from '@/components/pages/website-list/website-list-stats';
import { WebsiteListEmptyState } from '@/components/pages/website-list/website-list-empty-state';
import { WebsiteAddOrUpdateDialog } from '@/components/pages/website-list/website-add-update-dialog';
import { ProcessedWebsite } from '@/types/website';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { WebsiteStatus } from '@prisma/client';

interface DashboardPageProps {
  websites: ProcessedWebsite[];
  stats: {
    total: number;
    online: number;
    issues: number;
    avgUptime: number;
    avgResponse: number;
  };
}

export default function DashboardPage({ websites, stats }: DashboardPageProps) {
  const hasWebsites = websites.length > 0;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<WebsiteStatus[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('refreshing data');
      router.refresh();
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [router]);

  // Filter websites based on search query and selected statuses
  const filteredWebsites = useMemo(() => {
    return websites.filter(website => {
      // Apply search filter
      const matchesSearch =
        searchQuery === '' ||
        website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.url.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply status filter
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(website.status);

      return matchesSearch && matchesStatus;
    });
  }, [websites, searchQuery, selectedStatuses]);

  return (
    <div className="container space-y-6 p-8 pt-6 w-full max-w-screen-xl mx-auto">
      <WebsiteListHeader />

      {hasWebsites ? (
        <>
          <WebsiteListStats stats={stats} />
          <WebsiteListFilters
            onSearch={setSearchQuery}
            onFilterStatus={setSelectedStatuses}
          />
          <WebsiteListTable websites={filteredWebsites} />
        </>
      ) : (
        <WebsiteListEmptyState />
      )}

      <div className="fixed bottom-8 right-8">
        <WebsiteAddOrUpdateDialog>
          <Button
            size="lg"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle className="h-5 w-5" />
            Add Website
          </Button>
        </WebsiteAddOrUpdateDialog>
      </div>
    </div>
  );
}
