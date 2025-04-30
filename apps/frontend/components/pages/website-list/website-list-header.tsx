import { HelpCircle, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { WebsiteHelpModal } from './website-help-modal';
import Link from 'next/link';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function WebsiteListHeader({ balance }: { balance: number }) {
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
              <div className="flex items-center gap-2">
                <Link href="/deposits">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 border-zinc-800 bg-zinc-950 cursor-pointer hover:bg-zinc-900"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Deposit |</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL{' '}
                    </span>
                  </Button>
                </Link>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add funds to keep your websites monitored</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-zinc-800 bg-zinc-950 cursor-pointer hover:bg-zinc-900"
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
