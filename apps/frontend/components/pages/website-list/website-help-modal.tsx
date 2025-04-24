import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WebsiteHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebsiteHelpModal({
  open,
  onOpenChange,
}: WebsiteHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] w-[90vw] bg-zinc-950 border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            How to Use DPIN Uptime
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            A comprehensive guide to monitoring your websites
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-500">
                Getting Started
              </h3>
              <p className="text-sm text-zinc-300">
                DPIN Uptime helps you monitor your websites&apos; availability
                and performance in real-time. Add your websites and get instant
                notifications when they go down or experience issues.
                <br />
                <br /> To get started,
                <br />
                Click the
                <span className="font-semibold text-emerald-500">
                  {' '}
                  Add&nbsp;Website
                </span>{' '}
                button in the bottom right corner of the page.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-500">
                Key Features
              </h3>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-2">
                <li>Real-time monitoring of website status</li>
                <li>Uptime tracking and availability statistics</li>
                <li>Response time monitoring</li>
                <li>Status history and trend analysis</li>
                <li>Instant notifications for downtime</li>
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-500">
                Website Status Types
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold">Online:</span> Website is
                    functioning normally
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold">Degraded:</span> Website is
                    experiencing performance issues
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold">Offline:</span> Website is
                    not responding
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-500">
                Managing Websites
              </h3>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-2">
                <li>
                  Click <span className="font-semibold">Add Website</span> to
                  monitor a new website
                </li>
                <li>Use filters to sort and search through your websites</li>
                <li>
                  Click on a website to view detailed statistics and history
                </li>
                <li>Configure notification settings for each website</li>
              </ul>
            </section>
          </div>

          <section className="space-y-3 border-t border-zinc-800 pt-4 mt-6">
            <h3 className="text-lg font-semibold text-emerald-500">
              Need More Help?
            </h3>
            <p className="text-sm text-zinc-300">
              For additional support or feature requests, please contact our
              support team or visit our documentation.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
