'use client';

import { useState } from 'react';
import { ChevronDown, Filter, Search, SortAsc, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { WebsiteStatus } from '@prisma/client';

interface WebsiteListFiltersProps {
  onSearch: (search: string) => void;
  onFilterStatus: (statuses: WebsiteStatus[]) => void;
}

export function WebsiteListFilters({
  onSearch,
  onFilterStatus,
}: WebsiteListFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<WebsiteStatus[]>([]);

  // Status options
  const statusOptions = [
    { value: WebsiteStatus.ONLINE, label: 'Online' },
    { value: WebsiteStatus.OFFLINE, label: 'Offline' },
    { value: WebsiteStatus.DEGRADED, label: 'Degraded' },
  ];

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  // Toggle status selection
  const toggleStatus = (status: WebsiteStatus) => {
    let newStatuses: WebsiteStatus[];
    if (selectedStatuses.includes(status)) {
      newStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      newStatuses = [...selectedStatuses, status];
    }
    setSelectedStatuses(newStatuses);
    onFilterStatus(newStatuses);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedStatuses([]);
    onFilterStatus([]);
  };

  // Check if any filters are applied
  const hasFilters = selectedStatuses.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="w-full border-zinc-800 bg-zinc-950 pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-1 border-zinc-800 bg-zinc-950"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {hasFilters && (
                  <Badge className="ml-1 bg-emerald-500 text-white">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-zinc-800 bg-zinc-950"
            >
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {statusOptions.map(status => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={() => toggleStatus(status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}

              {hasFilters && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-400">Active filters:</span>
          {selectedStatuses.map(status => (
            <Badge
              key={status}
              variant="outline"
              className="gap-1 border-zinc-700 bg-zinc-900"
            >
              Status: {status}
              <button onClick={() => toggleStatus(status)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-zinc-400 hover:text-zinc-300"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
