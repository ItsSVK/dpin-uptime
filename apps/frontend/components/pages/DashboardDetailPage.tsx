'use client';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  SendHorizonal,
  Info,
  CheckIcon,
  CopyIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebsiteHeader } from '@/components/pages/website/website-header';
import { WebsiteOverview } from '@/components/pages/website/website-overview';
import { UptimeHistoryChart } from '@/components/pages/website/uptime-history-chart';
import { ResponseTimeChart } from '@/components/pages/website/response-time-chart';
import { useState, useEffect } from 'react';
import {
  getWebsite,
  hasActiveValidators,
  sendEmailTestAlert,
  sendWebhookTestAlert,
} from '@/actions/website';
import { processWebsiteData } from '@/lib/websiteUtils';
import { ProcessedWebsite } from '@/types/website';
import { NotificationConfig } from '@/types/notification';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import NotificationUpdateDialog from '@/components/pages/notification-update-dialog';
import { WebhookDocsModal } from '@/components/pages/WebhookDocsModal';

export default function DashboardDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [website, setWebsite] = useState<ProcessedWebsite | null>(null);
  const [hasActiveValidator, setHasActiveValidator] = useState(false);

  const [notificationConfig, setNotificationConfig] =
    useState<NotificationConfig>({
      email: null,
      webhookUrl: null,
      webhookSecret: null,
      isHighPingAlertEnabled: false,
      isDownAlertEnabled: false,
    });
  // const [notifications, setNotifications] = useState({
  //   email: notificationConfig.email !== null,
  //   sms: false,
  //   slack: false,
  //   webhook: !!notificationConfig.webhookUrl,
  // });
  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [isSendingTestEmailAlert, setIsSendingTestEmailAlert] = useState(false);
  const [isSendingTestWebhookAlert, setIsSendingTestWebhookAlert] =
    useState(false);
  const [isWebhookDocsOpen, setIsWebhookDocsOpen] = useState(false);
  useEffect(() => {
    const fetchWebsite = async () => {
      const response = await getWebsite(id);
      const hasActiveValidatorResponse = await hasActiveValidators();
      if (response.success && response.data) {
        setWebsite(processWebsiteData(response.data));
        setHasActiveValidator(hasActiveValidatorResponse.data || false);
        setNotificationConfig(response.data.notificationConfig);
      } else {
        toast.error(response.message || 'Failed to fetch website');
        router.push('/dashboard');
      }
    };
    fetchWebsite();
    const interval = setInterval(fetchWebsite, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [id, router]);

  const handleSendTestAlert = async (type: 'email' | 'webhook') => {
    if (isSendingTestEmailAlert || isSendingTestWebhookAlert) {
      return;
    }
    if (
      type === 'email' &&
      !!notificationConfig.email &&
      (notificationConfig.isDownAlertEnabled ||
        notificationConfig.isHighPingAlertEnabled)
    ) {
      setIsSendingTestEmailAlert(true);
      const response = await sendEmailTestAlert(id);
      if (response.success) {
        toast.success(`We have sent Test Alert to ${notificationConfig.email}`);
      } else {
        toast.error(response.message || 'Failed to send Test Alert');
      }
      router.refresh();
      setIsSendingTestEmailAlert(false);
    }

    if (type === 'webhook' && !!notificationConfig.webhookUrl) {
      setIsSendingTestWebhookAlert(true);
      const response = await sendWebhookTestAlert(id);
      if (response.success) {
        toast.success(
          `We have sent Test Alert to ${notificationConfig.webhookUrl}`
        );
      } else {
        toast.error(response.message || 'Failed to send Test Alert');
      }
      router.refresh();
      setIsSendingTestWebhookAlert(false);
    }
  };

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container space-y-6 p-8 pt-6 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="cursor-pointer"
            onClick={() => router.back()}
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{website.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="cursor-pointer"
          >
            <a href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Visit website</span>
            </a>
          </Button>
        </div>
      </div>

      {!hasActiveValidator && (
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

      <WebsiteHeader website={website} />

      <WebsiteOverview website={website} />

      <Tabs defaultValue="uptime" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto bg-zinc-800 p-1 rounded-md h-10">
          <TabsTrigger
            value="uptime"
            className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white rounded-sm cursor-pointer"
          >
            Uptime
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white rounded-sm cursor-pointer"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="uptime" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <UptimeHistoryChart website={website} />
            </div>
            <div>
              <ResponseTimeChart website={website} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 pt-4">
          <div className="grid gap-12">
            <ResponseTimeChart website={website} />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="space-y-4 pt-4">
          {/* <div
            className={`bg-${
              website.user.emailAlertQuota === 0 ? 'amber' : 'emerald'
            }-900/20 border-l-4 border-${
              website.user.emailAlertQuota === 0 ? 'amber' : 'emerald'
            }-500 p-2 rounded-md backdrop-blur-sm`}
          > */}
          <div className="bg-emerald-900/20 border-l-4 border-emerald-500 p-2 rounded-md backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className={`text-sm text-emerald-200`}>
                  For testing purposes, currently all emails are sent through
                  Gmail only - please check your spam folder if not received in
                  your inbox.
                </p>
              </div>
            </div>
          </div>
          {/* <div
            className={`bg-${
              website.user.emailAlertQuota === 0 ? 'amber' : 'emerald'
            }-900/20 border-l-4 border-${
              website.user.emailAlertQuota === 0 ? 'amber' : 'emerald'
            }-500 p-2 rounded-md backdrop-blur-sm`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {website.user.emailAlertQuota === 0 ? (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm text-${
                    website.user.emailAlertQuota === 0 ? 'amber' : 'emerald'
                  }-200`}
                >
                  {website.user.emailAlertQuota === 0
                    ? `No email alerts available (capped at 10/day). Next reset: ${website.user.emailAlertReset}.`
                    : `${website.user.emailAlertQuota} email alerts remaining. Resets on ${website.user.emailAlertReset}. Daily limit capped at 10.`}
                </p>
              </div>
            </div>
          </div> */}
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure who gets notified when issues occur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Mail className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-zinc-400">
                        {notificationConfig.email || 'No email set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p
                              className={`text-sm ${
                                !!notificationConfig.email &&
                                (notificationConfig.isDownAlertEnabled ||
                                  notificationConfig.isHighPingAlertEnabled)
                                  ? 'text-zinc-400 cursor-pointer transition-all duration-200 hover:bg-zinc-700/50'
                                  : 'text-zinc-500 cursor-not-allowed opacity-50'
                              } bg-zinc-800/50 px-2 py-1 rounded-md flex items-center gap-2`}
                              onClick={() => handleSendTestAlert('email')}
                            >
                              {isSendingTestEmailAlert ? (
                                <>
                                  <Globe className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  Send Test Alert
                                  <SendHorizonal
                                    className={`h-4 w-4 ${
                                      !!notificationConfig.email &&
                                      (notificationConfig.isDownAlertEnabled ||
                                        notificationConfig.isHighPingAlertEnabled)
                                        ? 'text-zinc-400'
                                        : 'text-zinc-500'
                                    }`}
                                  />
                                </>
                              )}
                            </p>
                          </TooltipTrigger>
                          {!(
                            !!notificationConfig.email &&
                            (notificationConfig.isDownAlertEnabled ||
                              notificationConfig.isHighPingAlertEnabled)
                          ) && (
                            <TooltipContent>
                              <p>
                                Enable email notifications to send a test alert
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={
                          !!notificationConfig.email &&
                          (notificationConfig.isDownAlertEnabled ||
                            notificationConfig.isHighPingAlertEnabled)
                        }
                        onChange={() => setHandleModalOpen(true)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>
                {/* 
                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Phone className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">SMS Notifications</h3>
                        <p className="text-sm text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                          Feature under development
                        </p>
                      </div>
                      <p className="text-sm text-zinc-400">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => setHandleModalOpen(true)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Slack className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Slack Integration</h3>
                        <p className="text-sm text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                          Feature under development
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.slack}
                        onChange={() => setHandleModalOpen(true)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div> */}

                <div className="flex items-center justify-between rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
                      <Link2 className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Webhook</h3>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {notificationConfig.webhookUrl || 'No webhook set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p
                              className={`text-sm ${
                                !!notificationConfig.webhookUrl
                                  ? 'text-zinc-400 cursor-pointer transition-all duration-200 hover:bg-zinc-700/50'
                                  : 'text-zinc-500 cursor-not-allowed opacity-50'
                              } bg-zinc-800/50 px-2 py-1 rounded-md flex items-center gap-2`}
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  notificationConfig.webhookSecret || ''
                                );

                                const copyIcon = document.getElementById(
                                  `webhook-secret-copy-icon`
                                );
                                const checkIcon = document.getElementById(
                                  `webhook-secret-check-icon`
                                );

                                copyIcon?.classList.add('hidden');
                                checkIcon?.classList.remove('hidden');

                                setTimeout(() => {
                                  copyIcon?.classList.remove('hidden');
                                  checkIcon?.classList.add('hidden');
                                }, 1000);
                              }}
                            >
                              <>
                                Copy Secret
                                <CopyIcon
                                  id={`webhook-secret-copy-icon`}
                                  className={`h-4 w-4 ${!!notificationConfig.webhookUrl ? 'text-zinc-400' : 'text-zinc-500'}`}
                                />
                                <CheckIcon
                                  id={`webhook-secret-check-icon`}
                                  className="w-4 h-4 hidden"
                                />
                              </>
                            </p>
                          </TooltipTrigger>
                          {!!!notificationConfig.webhookUrl && (
                            <TooltipContent>
                              <p>Enable webhook to copy secret</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <p
                        className={`text-sm text-zinc-400 cursor-pointer transition-all duration-200 hover:bg-zinc-700/50 bg-zinc-800/50 px-2 py-1 rounded-md flex items-center gap-2`}
                        onClick={() => {
                          setIsWebhookDocsOpen(true);
                        }}
                      >
                        DOCS
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p
                              className={`text-sm ${
                                !!notificationConfig.webhookUrl &&
                                (notificationConfig.isDownAlertEnabled ||
                                  notificationConfig.isHighPingAlertEnabled)
                                  ? 'text-zinc-400 cursor-pointer transition-all duration-200 hover:bg-zinc-700/50'
                                  : 'text-zinc-500 cursor-not-allowed opacity-50'
                              } bg-zinc-800/50 px-2 py-1 rounded-md flex items-center gap-2`}
                              onClick={() => handleSendTestAlert('webhook')}
                            >
                              {isSendingTestWebhookAlert ? (
                                <>
                                  <Globe className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  Send Test Alert
                                  <SendHorizonal
                                    className={`h-4 w-4 ${
                                      !!notificationConfig.webhookUrl &&
                                      (notificationConfig.isDownAlertEnabled ||
                                        notificationConfig.isHighPingAlertEnabled)
                                        ? 'text-zinc-400'
                                        : 'text-zinc-500'
                                    }`}
                                  />
                                </>
                              )}
                            </p>
                          </TooltipTrigger>
                          {!(
                            !!notificationConfig.webhookUrl &&
                            (notificationConfig.isDownAlertEnabled ||
                              notificationConfig.isHighPingAlertEnabled)
                          ) && (
                            <TooltipContent>
                              <p>Enable webhook to send a test alert</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={
                          !!notificationConfig.webhookUrl &&
                          (notificationConfig.isDownAlertEnabled ||
                            notificationConfig.isHighPingAlertEnabled)
                        }
                        onChange={() => setHandleModalOpen(true)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <NotificationUpdateDialog
        id={id}
        isModalOpen={handleModalOpen}
        setIsModalOpen={setHandleModalOpen}
        setNotificationConfig={setNotificationConfig}
      />
      <WebhookDocsModal
        open={isWebhookDocsOpen}
        onOpenChange={setIsWebhookDocsOpen}
      />
    </div>
  );
}
