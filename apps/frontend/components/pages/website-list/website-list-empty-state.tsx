import { Globe, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteAddOrUpdateDialog } from '@/components/pages/website-list/website-add-update-dialog';

export function WebsiteListEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900">
        <Globe className="h-10 w-10 text-zinc-500" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No websites yet</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        You haven&apos;t added any websites to monitor yet. Add your first
        website to start tracking its uptime and performance.
      </p>
      <div className="mt-6">
        <WebsiteAddOrUpdateDialog>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Add Your First Website
          </Button>
        </WebsiteAddOrUpdateDialog>
      </div>
    </div>
  );
}
