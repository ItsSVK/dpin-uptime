import type { SignupOutgoingMessage } from 'common';

export const CALLBACKS: {
  [callbackId: string]: (data: SignupOutgoingMessage) => void;
} = {};

export let validatorId: string | null = null;

export function setValidatorId(id: string) {
  validatorId = id;
}
