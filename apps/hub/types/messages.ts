import { MessageType } from 'common';

export interface ValidationData {
  validatorId: string;
  statusCode: number;
  nameLookup: number;
  connection: number;
  tlsHandshake: number;
  dataTransfer: number;
  ttfb: number;
  total: number;
  error: string | null;
  signedMessage: string;
  callbackId: string;
  websiteId: string;
  url: string;
}

export interface SignupData {
  callbackId: string;
  publicKey: string;
  signedMessage: string;
}

export type IncomingMessage =
  | { type: MessageType.VALIDATE; data: ValidationData }
  | { type: MessageType.SIGNUP; data: SignupData }
  | { type: MessageType.HEARTBEAT };
