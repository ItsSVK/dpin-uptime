import type { IncomingMessage } from 'common';
import type { Region } from '@prisma/client';

// In-memory map for websocket callbacks
export const CALLBACKS: {
  [callbackId: string]: (data: IncomingMessage) => void;
} = {};

// Cost and timeout constants
export const COST_PER_VALIDATION = 100; // in lamports
export const VALIDATION_TIMEOUT = 10000; // 10 seconds
export const PLATFORM_FEE_PERCENT = 0.1; // 10% platform fee

// Website status and ping monitoring constants
export const lastWebsiteStatus: Record<string, 'DOWN' | 'UP'> = {};
export const recentPings: Record<string, Record<string, number[]>> = {};
export const PING_HISTORY_LIMIT = 10; // Number of recent pings to keep per region
export const PING_ANOMALY_THRESHOLD = 2.5; // Notify if ping is 2.5x the average

// Type for WebSocket data, will be moved to a websocket specific module later
export type MyWebSocketData = {
  clientIp: string;
};
