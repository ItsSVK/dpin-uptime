import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { WebsiteHelpModal } from './website-help-modal';

export function WebsiteListHeader() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Websites</h1>
        <p className="text-sm text-zinc-500">
          Manage and monitor all your websites in one place.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-zinc-800 bg-zinc-950"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn how to manage your websites</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <WebsiteHelpModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      </div>
    </div>
  );
}
