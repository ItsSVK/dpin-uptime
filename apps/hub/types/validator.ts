import { ServerWebSocket } from 'bun';
import { Region } from '@prisma/client';

export interface ValidatorMetrics {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
  lastUsed: Date;
  activeChecks: number;
  trustScore: number;
}

export interface ValidatorGroup {
  region: Region;
  validators: ValidatorMetrics[];
}

export interface ValidatorSelection {
  validator: ValidatorMetrics;
  group: ValidatorGroup;
}
