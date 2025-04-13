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
  responseTime: number;
  uptime: number;
  lastChecked: string;
  uptimeTicks: WebsiteStatus[];
  uptimePercentage: number;
}
