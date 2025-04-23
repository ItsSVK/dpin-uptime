'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Edit,
  Pause,
  Play,
  Trash2,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WebsiteStatus } from '@prisma/client';
import { ProcessedWebsite } from '@/types/website';
import { WebsiteAddOrUpdateDialog } from '@/components/pages/website-list/website-add-update-dialog';
import { WebsiteDeleteDialog } from './website-delete-dialog';
import { deleteWebsite, updateWebsite } from '@/actions/website';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
interface WebsiteListTableProps {
  websites: ProcessedWebsite[];
}

export function WebsiteListTable({ websites }: WebsiteListTableProps) {
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const router = useRouter();
  // Toggle selection of a single website
  const toggleWebsiteSelection = (id: string) => {
    if (selectedWebsites.includes(id)) {
      setSelectedWebsites(
        selectedWebsites.filter(websiteId => websiteId !== id)
      );
    } else {
      setSelectedWebsites([...selectedWebsites, id]);
    }
  };

  // Toggle selection of all websites
  const toggleAllWebsites = () => {
    if (selectedWebsites.length === websites.length) {
      setSelectedWebsites([]);
    } else {
      setSelectedWebsites(websites.map(website => website.id));
    }
  };

  const toggleWebsitePause = async (id: string) => {
    const website = websites.find(website => website.id === id);
    if (!website) return;
    const response = await updateWebsite(id, {
      isPaused: !website.isPaused,
    });
    if (response.success) {
      toast.success('Website updated successfully');
      router.refresh();
    } else {
      toast.error(response.message || 'Failed to update website');
    }
  };

  // Check if all websites are selected
  const allSelected =
    selectedWebsites.length === websites.length && websites.length > 0;

  // Check if some websites are selected
  const someSelected =
    selectedWebsites.length > 0 && selectedWebsites.length < websites.length;

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950">
      {selectedWebsites.length > 0 && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              ref={checkbox => {
                if (checkbox) (checkbox as any).indeterminate = someSelected;
              }}
              onCheckedChange={toggleAllWebsites}
              className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
            />
            <span className="text-sm font-medium">
              {selectedWebsites.length}{' '}
              {selectedWebsites.length === 1 ? 'website' : 'websites'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <WebsiteDeleteDialog
              websiteName={`these websites (${selectedWebsites.length} in total)`}
              onDelete={async () => {
                const response = await deleteWebsite(selectedWebsites);
                if (response.success) {
                  toast.success('Website(s) deleted successfully');
                  router.refresh();
                  setSelectedWebsites([]);
                } else {
                  toast.error(
                    response.message || 'Failed to delete website(s)'
                  );
                }
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete {selectedWebsites.length} website(s)</span>
              </Button>
            </WebsiteDeleteDialog>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                ref={checkbox => {
                  if (checkbox) (checkbox as any).indeterminate = someSelected;
                }}
                onCheckedChange={toggleAllWebsites}
                className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
              />
            </TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uptime</TableHead>
            <TableHead className="hidden md:table-cell">
              Response Time
            </TableHead>
            <TableHead className="hidden lg:table-cell">Last Checked</TableHead>
            <TableHead className="hidden xl:table-cell">
              Check Frequency
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.map(website => (
            <TableRow
              key={website.id}
              className="border-zinc-800 hover:bg-zinc-900/50"
            >
              <TableCell>
                <Checkbox
                  checked={selectedWebsites.includes(website.id)}
                  onCheckedChange={() => toggleWebsiteSelection(website.id)}
                  className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <Link
                    href={`/dashboard/${website.id}`}
                    className="font-medium text-white hover:underline"
                  >
                    {website.name}
                  </Link>
                  <span className="text-xs text-zinc-400">{website.url}</span>
                </div>
              </TableCell>
              <TableCell>
                {website.status === WebsiteStatus.ONLINE ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
                    <Check className="mr-1 h-3 w-3" />
                    Online
                  </Badge>
                ) : website.status === WebsiteStatus.OFFLINE ? (
                  <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                    <X className="mr-1 h-3 w-3" />
                    Offline
                  </Badge>
                ) : website.status === WebsiteStatus.DEGRADED ? (
                  <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Degraded
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-500/20 text-zinc-500 hover:bg-zinc-500/30">
                    <HelpCircle className="mr-1 h-3 w-3" />
                    Unknown
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full ${
                        website.uptimePercentage >= 99.9
                          ? 'bg-emerald-500'
                          : website.uptimePercentage >= 99
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${website.uptimePercentage}%` }}
                    ></div>
                  </div>
                  <span>{website.uptimePercentage.toFixed(2)}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {website.responseTime !== null ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={`
                      ${
                        website.responseTime < 200
                          ? 'text-emerald-500'
                          : website.responseTime < 500
                            ? 'text-amber-500'
                            : 'text-red-500'
                      }
                    `}
                    >
                      {Math.round(website.responseTime)}ms
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-500">-</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{website.lastChecked}</span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="text-zinc-400">
                  {Math.round(website.checkFrequency / 60)} minutes
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            website.isPaused
                              ? 'hover:bg-emerald-500/20'
                              : 'hover:bg-amber-500/20'
                          }`}
                          onClick={() => {
                            toggleWebsitePause(website.id);
                          }}
                        >
                          {website.isPaused ? (
                            <Play className="h-4 w-4 text-emerald-400 hover:text-emerald-500" />
                          ) : (
                            <Pause className="h-4 w-4 text-amber-200 hover:text-amber-300" />
                          )}
                          <span className="sr-only">
                            {website.isPaused ? 'Resume' : 'Pause'}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{website.isPaused ? 'Resume' : 'Pause'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <WebsiteAddOrUpdateDialog
                    data={{
                      id: website.id,
                      url: website.url,
                      name: website.name,
                      checkFrequency: website.checkFrequency.toString(),
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-emerald-500/10"
                    >
                      <Edit className="h-4 w-4 text-emerald-600 hover:text-emerald-500" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </WebsiteAddOrUpdateDialog>
                  <WebsiteDeleteDialog
                    websiteName={website.name}
                    onDelete={async () => {
                      const response = await deleteWebsite([website.id]);
                      if (response.success) {
                        toast.success('Website deleted successfully');
                        router.refresh();
                      } else {
                        toast.error(
                          response.message || 'Failed to delete website'
                        );
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 hover:text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </WebsiteDeleteDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
