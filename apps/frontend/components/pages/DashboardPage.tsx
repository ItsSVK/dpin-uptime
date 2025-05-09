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
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface DashboardPageProps {
  websites: ProcessedWebsite[];
  stats: {
    total: number;
    online: number;
    issues: number;
    avgUptime: number;
    avgResponse: number;
    hasActiveValidator: boolean;
    userBalance: number;
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
    }, 1000 * 20);

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
      <WebsiteListHeader balance={stats.userBalance} />

      {!stats.hasActiveValidator && (
        <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-md backdrop-blur-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-200">
                No active validators available. Website monitoring is currently
                paused.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.userBalance < 0.1 * LAMPORTS_PER_SOL && (
        <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-md backdrop-blur-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-200">
                Your balance is low. Please add more SOL to your balance to
                continue monitoring.
              </p>
            </div>
          </div>
        </div>
      )}

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
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            Add Website
          </Button>
        </WebsiteAddOrUpdateDialog>
      </div>
    </div>
  );
}
