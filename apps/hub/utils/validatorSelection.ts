import { prismaClient } from 'db/client';
import { Region } from '@prisma/client';
import type { ServerWebSocket } from 'bun';

interface ValidatorMetrics {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
  lastHeartbeat?: number;
  lastUsed: Date;
  activeChecks: number;
  trustScore: number;
  // Track per-hour assignment timestamps
  assignmentTimestamps?: number[];
}

interface ValidatorGroup {
  validators: ValidatorMetrics[];
  region: Region;
}

export class ValidatorManager {
  private validatorGroups: Map<Region, ValidatorGroup>;
  private heartbeatTimeout: number = 30000; // 30 seconds timeout
  private heartbeatInterval: number = 10000; // Check every 10 seconds

  constructor() {
    this.validatorGroups = new Map();
    // Start heartbeat checker
    setInterval(() => this.checkHeartbeats(), this.heartbeatInterval);
  }

  public addValidator(
    validator: Omit<
      ValidatorMetrics,
      'lastUsed' | 'activeChecks' | 'lastHeartbeat'
    >,
    region: Region
  ): void {
    let group = this.validatorGroups.get(region);
    if (!group) {
      group = { validators: [], region };
      this.validatorGroups.set(region, group);
    }

    const newValidator: ValidatorMetrics = {
      ...validator,
      lastHeartbeat: Date.now(),
      lastUsed: new Date(0),
      activeChecks: 0,
      trustScore: validator.trustScore ?? 0,
    };

    group.validators.push(newValidator);
  }

  public removeValidator(validatorId: string): void {
    for (const group of this.validatorGroups.values()) {
      const index = group.validators.findIndex(
        v => v.validatorId === validatorId
      );
      if (index !== -1) {
        group.validators.splice(index, 1);
        break;
      }
    }
  }

  public updateHeartbeat(validatorId: string): void {
    for (const group of this.validatorGroups.values()) {
      const validator = group.validators.find(
        v => v.validatorId === validatorId
      );
      if (validator) {
        validator.lastHeartbeat = Date.now();
        break;
      }
    }
  }

  private checkHeartbeats(): void {
    const now = Date.now();

    for (const group of this.validatorGroups.values()) {
      for (const validator of [...group.validators]) {
        if (
          !validator.lastHeartbeat ||
          now - validator.lastHeartbeat > this.heartbeatTimeout
        ) {
          console.log(
            `Validator ${validator.validatorId} timed out - no heartbeat received`
          );
          // Close the socket which will trigger the close handler
          validator.socket.close();
          this.removeValidator(validator.validatorId);
          (async () => {
            await prismaClient.validator.update({
              where: { id: validator.validatorId },
              data: {
                isActive: false,
              },
            });
          })();
        }
      }
    }
  }

  // Helper to get tier from trustScore
  private getTier(trustScore: number): 'New' | 'Trusted' | 'Expert' {
    if (trustScore >= 500) return 'Expert';
    if (trustScore >= 100) return 'Trusted';
    return 'New';
  }

  // Helper to get per-hour limit for a tier
  private getHourlyLimit(tier: 'New' | 'Trusted' | 'Expert'): number {
    if (tier === 'Expert') return 500;
    if (tier === 'Trusted') return 200;
    return 50;
  }

  // Helper to check if validator is under hourly limit
  private isUnderHourlyLimit(validator: ValidatorMetrics): boolean {
    const tier = this.getTier(validator.trustScore);
    const limit = this.getHourlyLimit(tier);
    const now = Date.now();
    // Clean up timestamps older than 1 hour
    if (!validator.assignmentTimestamps) validator.assignmentTimestamps = [];
    validator.assignmentTimestamps = validator.assignmentTimestamps.filter(
      ts => now - ts < 60 * 60 * 1000
    );
    return validator.assignmentTimestamps.length < limit;
  }

  // Call this when assigning a validation
  private recordAssignment(validator: ValidatorMetrics) {
    if (!validator.assignmentTimestamps) validator.assignmentTimestamps = [];
    validator.assignmentTimestamps.push(Date.now());
  }

  private selectFromGroup(group: ValidatorGroup): ValidatorMetrics | null {
    // Only consider validators under their hourly limit
    const available = group.validators.filter(v => this.isUnderHourlyLimit(v));
    if (available.length === 0) {
      // Fallback: if all are over limit, pick the least recently used validator
      if (group.validators.length > 0) {
        return group.validators.sort(
          (a, b) => a.lastUsed.getTime() - b.lastUsed.getTime()
        )[0];
      }
      return null;
    }
    return available.sort((a, b) => {
      if (a.activeChecks !== b.activeChecks) {
        return a.activeChecks - b.activeChecks;
      }
      return a.lastUsed.getTime() - b.lastUsed.getTime();
    })[0];
  }

  public getValidatorForRegion(region: Region): ValidatorMetrics | null {
    const group = this.validatorGroups.get(region);
    if (!group || group.validators.length === 0) {
      return null;
    }
    // Exclude low trustScore validators
    const eligible = group.validators.filter(v => v.trustScore >= -10);
    if (eligible.length === 0) return null;
    return this.selectFromGroup({ ...group, validators: eligible });
  }

  public getAllValidators(): ValidatorMetrics[] {
    const allValidators: ValidatorMetrics[] = [];
    for (const group of this.validatorGroups.values()) {
      allValidators.push(...group.validators);
    }
    return allValidators;
  }

  selectValidators(): Map<Region, ValidatorMetrics | null> {
    const selections = new Map<Region, ValidatorMetrics | null>();

    // Try to select a validator from each region
    for (const region of Object.values(Region)) {
      const group = this.validatorGroups.get(region);
      if (!group) {
        selections.set(region, null);
        continue;
      }

      const validator = this.getValidatorForRegion(region);
      if (validator) {
        selections.set(region, validator);
      } else {
        selections.set(region, null);
      }
    }

    return selections;
  }

  updateValidatorMetrics(validatorId: string, isStarting: boolean) {
    for (const group of this.validatorGroups.values()) {
      const validator = group.validators.find(
        v => v.validatorId === validatorId
      );
      if (validator) {
        if (isStarting) {
          validator.activeChecks++;
          validator.lastUsed = new Date();
        } else {
          validator.activeChecks = Math.max(0, validator.activeChecks - 1);
        }
        break;
      }
    }
  }

  getActiveValidatorsCount(): number {
    let count = 0;
    for (const group of this.validatorGroups.values()) {
      count += group.validators.length;
    }
    return count;
  }

  getValidatorsInRegion(region: Region): number {
    return this.validatorGroups.get(region)?.validators.length || 0;
  }

  public selectMultipleValidators(
    region: Region,
    count: number
  ): ValidatorMetrics[] {
    const group = this.validatorGroups.get(region);
    if (!group) return [];
    // Exclude low trustScore validators for main pool
    const eligible = group.validators.filter(
      v => v.trustScore >= -10 && this.isUnderHourlyLimit(v)
    );
    const lowTrust = group.validators.filter(
      v => v.trustScore < -10 && this.isUnderHourlyLimit(v)
    );
    let selected = eligible
      .sort(
        (a, b) =>
          b.trustScore - a.trustScore ||
          a.activeChecks - b.activeChecks ||
          a.lastUsed.getTime() - b.lastUsed.getTime()
      )
      .slice(0, count);
    // If not enough, add one low-trust validator for recovery
    if (selected.length < count && lowTrust.length > 0) {
      selected.push(lowTrust[0]);
    }
    // Fallback: if still not enough (e.g., all are over limit), pick least recently used validators
    if (selected.length < count) {
      const alreadySelectedIds = new Set(selected.map(v => v.validatorId));
      const fallback = group.validators
        .filter(v => !alreadySelectedIds.has(v.validatorId))
        .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())
        .slice(0, count - selected.length);
      selected = selected.concat(fallback);
    }
    // Record assignment for selected validators
    selected.forEach(v => this.recordAssignment(v));
    return selected;
  }
}
