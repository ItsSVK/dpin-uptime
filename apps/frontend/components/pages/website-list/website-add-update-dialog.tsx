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

interface AddOrUpdateWebsiteProps {
  id: string;
  url: string;
  name: string;
  checkFrequency: string;
}
interface WebsiteAddOrUpdateDialogProps {
  children: React.ReactNode;
  data?: AddOrUpdateWebsiteProps;
}

export function WebsiteAddOrUpdateDialog({
  children,
  data,
}: WebsiteAddOrUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [checkFrequency, setCheckFrequency] = useState('60');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const regex =
    /^(https?:\/\/)(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

  // Initialize form data when data prop changes or dialog opens
  useEffect(() => {
    if (data) {
      setUrl(data.url);
      setName(data.name);
      setCheckFrequency(data.checkFrequency);
    }
  }, [data]);

  const clearForm = () => {
    if (!data) {
      setUrl('');
      setName('');
      setCheckFrequency('60');
    }
    setValidationError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    if (!url || !regex.test(url)) {
      setValidationError('Please enter a valid URL');
      return;
    }

    // Simulate validation
    setIsValidating(true);
    setValidationError(null);

    // Mock API call
    const response = data
      ? await updateWebsite(data.id, {
          url,
          name,
          checkFrequency: parseInt(checkFrequency),
        })
      : await createWebsite(url, name, parseInt(checkFrequency));

    if (response.success) {
      setIsValidating(false);
      setOpen(false);
      toast.success(
        data ? 'Website updated' : 'Website added to monitoring list'
      );
      router.refresh();
    } else {
      setValidationError(response.message || 'Failed to add website');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen);
        if (!isOpen) {
          clearForm();
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
          {validationError && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>{validationError}</div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  // Auto-generate name from URL if name is empty
                  if (!name) {
                    try {
                      const urlObj = new URL(e.target.value);
                      setName(urlObj.hostname);
                    } catch (e) {
                      // Invalid URL, ignore
                      console.error(e);
                    }
                  }
                }}
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
                value={name}
                onChange={e => setName(e.target.value)}
                className="border-zinc-800 bg-zinc-900"
              />
              <p className="text-xs text-zinc-500">
                A friendly name to identify this website
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="check-frequency">Check Frequency</Label>
              <Select value={checkFrequency} onValueChange={setCheckFrequency}>
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
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearForm();
                setOpen(false);
              }}
              className="border-zinc-800 bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
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
