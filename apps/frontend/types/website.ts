import {
  Website as PrismaWebsite,
  WebsiteTick as PrismaWebsiteTick,
  WebsiteStatus,
} from '@prisma/client';

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
}
