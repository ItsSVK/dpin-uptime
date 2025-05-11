import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function WebhookDocsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 text-white border border-zinc-800 max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">
            Webhook Integration Guide
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div className="border-l-4 border-emerald-500 pl-4 bg-zinc-900 py-2">
            <p className="text-zinc-200 font-medium">
              DPIN Uptime can notify your systems of important events by sending
              a <span className="text-emerald-400">POST</span> request to your
              configured webhook URL.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              How It Works
            </h3>
            <ul className="list-disc ml-6 text-sm space-y-1">
              <li>
                When an event occurs (e.g.,{' '}
                <span className="text-emerald-400">website down</span>,{' '}
                <span className="text-emerald-400">high ping</span>), we send a{' '}
                <span className="text-emerald-400">POST</span> request to your
                webhook URL.
              </li>
              <li>
                The request contains a{' '}
                <span className="text-emerald-400">JSON</span> payload
                describing the event.
              </li>
              <li>
                We include a Webhook Secret as an{' '}
                <code className="text-emerald-400">X-Webhook-Secret</code>{' '}
                header for verification.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              Example Payload
            </h3>
            <pre className="bg-zinc-900 rounded p-3 text-xs overflow-x-auto border-l-4 border-emerald-500 text-zinc-300">
              {`{
  "event": "website_down",
  "websiteId": "abc123",
  "timestamp": "2024-06-01T12:34:56Z",
  "details": {
    "status": "DOWN",
    "region": "US",
    "websiteUrl": "https://example.com"
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">Security</h3>
            <p>We include a Webhook Secret as an HTTP header:</p>
            <pre className="bg-zinc-900 rounded p-3 text-xs overflow-x-auto border-l-4 border-emerald-500 text-zinc-300">
              X-Webhook-Secret: your-secret-value
            </pre>
            <p className="text-zinc-400">
              You should verify this header in your server before processing the
              payload.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              Example Receiver (Node.js/Express)
            </h3>
            <pre className="bg-zinc-900 rounded p-3 text-xs overflow-x-auto border-l-4 border-emerald-500 text-zinc-300">
              {`app.post('/my-webhook', (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.MY_WEBHOOK_SECRET) {
    console.log('Received webhook:', req.body);
  }
  res.send('OK');
});`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              Supported Events
            </h3>
            <ul className="list-disc ml-6 text-sm space-y-1">
              <li>
                <code className="text-emerald-400">website_down</code> — Your
                website is detected as DOWN
              </li>
              <li>
                <code className="text-emerald-400">website_up</code> — Your
                website is back UP
              </li>
              <li>
                <code className="text-emerald-400">high_ping</code> — Your
                website response time is high
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              Troubleshooting
            </h3>
            <ul className="list-disc ml-6 text-sm space-y-1">
              <li>
                Make sure your endpoint is publicly accessible and responds with
                a 2xx status code.
              </li>
              <li>If your webhook fails, we may retry a few times.</li>
              <li>Check your server logs for incoming requests.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
