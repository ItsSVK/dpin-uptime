'use client';

import {
  getNotificationConfig,
  updateNotificationConfig,
} from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  notificationConfigSchema,
  NotificationConfig,
} from '@/types/notification';
import { useRouter } from 'next/navigation';
export default function NotificationUpdateDialog({
  id,
  isModalOpen,
  setIsModalOpen,
  setNotificationConfig,
}: {
  id: string;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setNotificationConfig: (notificationConfig: NotificationConfig) => void;
}) {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isWebhookOk, setIsWebhookOk] = useState(true);
  const router = useRouter();
  const submitForm = async (data: NotificationConfig) => {
    // validate the form
    const validationResult = notificationConfigSchema.safeParse(data);
    if (!validationResult.success) {
      toast.error('Invalid form data');
      return;
    }
    // TODO: Implement email/webhook saving logic
    const result = await updateNotificationConfig({
      ...data,
      email: data.email || null,
      webhookUrl: data.webhookUrl || null,
      webhookSecret: data.webhookSecret || null,
      websiteId: id,
    });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    handleCloseModal();
    setNotificationConfig(
      result.data?.notificationConfig[0] as NotificationConfig
    );
    router.refresh();
  };

  const form = useForm<z.infer<typeof notificationConfigSchema>>({
    resolver: zodResolver(notificationConfigSchema),
    defaultValues: {
      email: null,
      webhookUrl: null,
      isDownAlertEnabled: false,
      isHighPingAlertEnabled: false,
    },
  });

  useEffect(() => {
    const fetchNotificationConfig = async () => {
      const notificationConfig = await getNotificationConfig(id);
      if (notificationConfig) {
        form.reset(notificationConfig);
      }
    };
    fetchNotificationConfig();
  }, [isModalOpen]);

  const handleCloseModal = () => {
    form.reset();
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="bg-zinc-950 text-white border border-zinc-800 max-w-2xl w-full">
        <form onSubmit={form.handleSubmit(submitForm)}>
          <DialogHeader>
            <DialogTitle>Update Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                  className="bg-zinc-900 text-white border-zinc-700 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Webhook URL</Label>
                <Input
                  type="text"
                  placeholder="https://example.com/webhook"
                  {...form.register('webhookUrl')}
                  onChange={e => {
                    form.setValue('webhookUrl', e.target.value);
                    setIsWebhookOk(false);
                  }}
                  className="bg-zinc-900 text-white border-zinc-700 w-full"
                />
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={async () => {
                    setIsTestingWebhook(true);
                    setTimeout(() => {
                      setIsTestingWebhook(false);
                      setIsWebhookOk(true);
                      toast.success('Test webhook sent! (simulated)');
                    }, 1000);
                  }}
                  disabled={
                    !form.getValues('webhookUrl') ||
                    (!!form.getValues('webhookUrl') && isTestingWebhook) ||
                    (!!form.getValues('webhookUrl') && isWebhookOk)
                  }
                >
                  {isTestingWebhook ? 'Sending...' : 'Test Webhook'}
                </Button>
              </div>
              <div className="space-y-4 pt-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.watch('isDownAlertEnabled')}
                    onCheckedChange={() =>
                      form.setValue(
                        'isDownAlertEnabled',
                        !form.getValues('isDownAlertEnabled')
                      )
                    }
                    className="accent-emerald-600"
                  />
                  Notify me when my website goes UP or DOWN
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.watch('isHighPingAlertEnabled')}
                    onCheckedChange={() =>
                      form.setValue(
                        'isHighPingAlertEnabled',
                        !form.getValues('isHighPingAlertEnabled')
                      )
                    }
                    className="accent-emerald-600"
                  />
                  Notify me when my website is responding with high ping
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                (!!form.watch('webhookUrl') && !isWebhookOk)
              }
            >
              {form.formState.isSubmitting ? (
                <>
                  <Globe className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
