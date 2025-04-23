import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WebsiteDeleteDialogProps {
  websiteName: string;
  children: React.ReactNode;
  onDelete: () => Promise<void>;
}

export function WebsiteDeleteDialog({
  websiteName,
  children,
  onDelete,
}: WebsiteDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete website:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete Website</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {websiteName}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            All monitoring data and history for this website will be permanently
            deleted.
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-zinc-800 bg-zinc-900"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Website'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
