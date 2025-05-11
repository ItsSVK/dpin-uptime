import { z } from 'zod';

export const notificationConfigSchema = z.object({
  email: z.string().optional().nullable(),
  webhookUrl: z.string().optional().nullable(),
  webhookSecret: z.string().optional().nullable(),
  isDownAlertEnabled: z.boolean(),
  isHighPingAlertEnabled: z.boolean(),
});

export type NotificationConfig = z.infer<typeof notificationConfigSchema>;
