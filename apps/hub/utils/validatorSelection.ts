import { Region } from '@prisma/client';
import {
  ValidatorGroup,
  ValidatorSelection,
  ValidatorMetrics,
} from '../types/validator';

export class ValidatorManager {
  private validatorGroups: Map<Region, ValidatorGroup> = new Map();

  addValidator(
    validatorMetrics: Omit<ValidatorMetrics, 'lastUsed' | 'activeChecks'>,
    region: Region
  ) {
    if (!this.validatorGroups.has(region)) {
      this.validatorGroups.set(region, {
        region,
        validators: [],
      });
    }

    const group = this.validatorGroups.get(region)!;
    const newValidator: ValidatorMetrics = {
      ...validatorMetrics,
      lastUsed: new Date(0),
      activeChecks: 0,
    };

    group.validators.push(newValidator);
  }

  removeValidator(validatorId: string) {
    for (const group of this.validatorGroups.values()) {
      const index = group.validators.findIndex(
        v => v.validatorId === validatorId
      );
      if (index !== -1) {
        group.validators.splice(index, 1);
        if (group.validators.length === 0) {
          // Remove empty groups
          for (const [key, value] of this.validatorGroups.entries()) {
            if (value === group) {
              this.validatorGroups.delete(key);
              break;
            }
          }
        }
        break;
      }
    }
  }

  private selectFromGroup(group: ValidatorGroup): ValidatorMetrics | null {
    if (group.validators.length === 0) return null;

    return group.validators.sort((a, b) => {
      if (a.activeChecks !== b.activeChecks) {
        return a.activeChecks - b.activeChecks;
      }
      return a.lastUsed.getTime() - b.lastUsed.getTime();
    })[0];
  }

  selectValidators(): Map<Region, ValidatorSelection | null> {
    const selections = new Map<Region, ValidatorSelection | null>();

    // Try to select a validator from each region
    for (const region of Object.values(Region)) {
      const group = this.validatorGroups.get(region);
      if (!group) {
        selections.set(region, null);
        continue;
      }

      const validator = this.selectFromGroup(group);
      if (validator) {
        selections.set(region, { validator, group });
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
}
