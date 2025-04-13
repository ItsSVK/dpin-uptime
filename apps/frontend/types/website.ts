import { WebsiteStatus } from '@prisma/client';

export interface ProcessedWebsite {
  id: string;
  url: string;
  status: WebsiteStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: WebsiteStatus[];
}

export interface WebsiteTick {
  id: string;
  websiteId: string;
  status: WebsiteStatus;
  createdAt: string;
}

export interface Website {
  id: string;
  url: string;
  ticks: WebsiteTick[];
}
