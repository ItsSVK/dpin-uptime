'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createWebsite, updateWebsite } from '@/actions/website';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Region } from '@prisma/client';
import { REGION_LABELS } from '@/lib/utils';
import {
  WebsiteAddOrUpdateDialogProps,
  WebsiteFormValues,
  websiteSchema,
} from '@/types/website';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function WebsiteAddOrUpdateDialog({
  children,
  data,
}: WebsiteAddOrUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  // Setup react-hook-form
  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      url: data?.url || '',
      name: data?.name || '',
      checkFrequency:
        (data?.checkFrequency?.toString() as WebsiteFormValues['checkFrequency']) ||
        '60',
      preferredRegion: data?.preferredRegion || null,
    },
  });

  // Reset form when dialog opens/closes or data changes
  useEffect(() => {
    if (open) {
      form.reset({
        url: data?.url || '',
        name: data?.name || '',
        checkFrequency:
          (data?.checkFrequency?.toString() as WebsiteFormValues['checkFrequency']) ||
          '60',
        preferredRegion: data?.preferredRegion || null,
      });
    }
  }, [open, data, form]);

  // Auto-generate name from URL if name is empty
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'url' && !form.getValues('name')) {
        try {
          const urlObj = new URL(value.url || '');
          form.setValue('name', urlObj.hostname, { shouldValidate: true });
        } catch {
          // ignore invalid URL
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const handleSubmit: React.FormEventHandler<HTMLFormElement> =
    form.handleSubmit(async (values: WebsiteFormValues) => {
      setIsValidating(true);

      const response = data
        ? await updateWebsite(data.id, {
            url: values.url,
            name: values.name,
            checkFrequency: parseInt(values.checkFrequency),
            preferredRegion: values.preferredRegion || undefined,
          })
        : await createWebsite(
            values.url,
            values.name,
            parseInt(values.checkFrequency),
            values.preferredRegion || undefined
          );

      setIsValidating(false);

      if (response.success) {
        setOpen(false);
        toast.success(
          data ? 'Website updated' : 'Website added to monitoring list'
        );
        router.refresh();
      } else {
        toast.error(response.message || 'Failed to add website');
      }
    });

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {data ? 'Update Website' : 'Add New Website'}
          </DialogTitle>
          <DialogDescription>
            {data
              ? 'Update the details of the website.'
              : 'Enter the details of the website you want to monitor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Show validation errors */}
          {(form.formState.errors.url ||
            form.formState.errors.name ||
            form.formState.errors.checkFrequency) && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                {form.formState.errors.url?.message ||
                  form.formState.errors.name?.message ||
                  form.formState.errors.checkFrequency?.message}
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...form.register('url')}
                className="border-zinc-800 bg-zinc-900"
              />
              <p className="text-xs text-zinc-500">
                Enter the full URL including https:// or http://
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="My Website"
                {...form.register('name')}
                className="border-zinc-800 bg-zinc-900"
              />
              <p className="text-xs text-zinc-500">
                A friendly name to identify this website
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="check-frequency">Check Frequency</Label>
              <Controller
                control={form.control}
                name="checkFrequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="check-frequency"
                      className="w-full border-zinc-800 bg-zinc-900"
                    >
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="w-full border-zinc-800 bg-zinc-950">
                      <SelectItem value="60">Every 60 seconds</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                      <SelectItem value="600">Every 10 minutes</SelectItem>
                      <SelectItem value="1800">Every 30 minutes</SelectItem>
                      <SelectItem value="3600">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferred-region">Preferred Region</Label>
              <Controller
                control={form.control}
                name="preferredRegion"
                render={({ field }) => (
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={value =>
                      field.onChange(value === '__none__' ? null : value)
                    }
                  >
                    <SelectTrigger
                      id="preferred-region"
                      className="w-full border-zinc-800 bg-zinc-900"
                    >
                      <SelectValue placeholder="Select region (optional)" />
                    </SelectTrigger>
                    <SelectContent className="w-full border-zinc-800 bg-zinc-950 max-h-60 overflow-y-auto">
                      <SelectItem value="__none__">No Preference</SelectItem>
                      {Object.values(Region).map(region => (
                        <SelectItem key={region} value={region}>
                          {REGION_LABELS[region] || region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-zinc-500 italic">
                Note: Only select a preferred region if required - as validation
                may fail if no active validators are available in that selected
                region.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
              className="border-zinc-800 bg-zinc-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Globe className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>{data ? 'Update Website' : 'Add Website'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
