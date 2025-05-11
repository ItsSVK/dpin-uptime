import {
  Website as PrismaWebsite,
  WebsiteTick as PrismaWebsiteTick,
  Region,
  WebsiteStatus,
} from '@prisma/client';
import { z } from 'zod';

export type Website = PrismaWebsite;
export type WebsiteTick = PrismaWebsiteTick;

export interface ProcessedWebsite extends Website {
  ticks: WebsiteTick[];
  status: WebsiteStatus;
  responseTime: number | null;
  lastChecked: string;
  uptimeTicks: WebsiteStatus[];
  uptimeHistory?: {
    period: string;
    uptimePercentage: number;
    averageResponse: number | null;
    totalIncidents: number;
    totalDowntime: number;
  }[];
  user: {
    emailAlertQuota: number;
    emailAlertReset: Date;
  };
}

export interface AddOrUpdateWebsiteProps {
  id: string;
  url: string;
  name: string;
  checkFrequency: string;
  preferredRegion?: Region | null;
}

export interface WebsiteAddOrUpdateDialogProps {
  children: React.ReactNode;
  data?: AddOrUpdateWebsiteProps;
}

export const websiteSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
  name: z.string().min(1, { message: 'Display name is required' }),
  checkFrequency: z.enum(['60', '300', '600', '1800', '3600']),
  preferredRegion: z.string().nullable().optional(),
});

export type WebsiteFormValues = z.infer<typeof websiteSchema>;
