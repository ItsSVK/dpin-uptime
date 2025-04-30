export * from './auth';
export * from './connection';

export interface SignupIncomingMessage {
  publicKey: string;
  signedMessage: string;
  callbackId: string;
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  region: string;
}

export interface ValidateIncomingMessage {
  callbackId: string;
  signedMessage: string;
  statusCode: number;
  nameLookup: number;
  connection: number;
  tlsHandshake: number;
  dataTransfer: number;
  ttfb: number;
  total: number;
  error: string;
  websiteId: string;
  validatorId: string;
}

export interface SignupOutgoingMessage {
  validatorId: string;
  callbackId: string;
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface ValidateOutgoingMessage {
  url: string;
  callbackId: string;
  websiteId: string;
}

export enum MessageType {
  SIGNUP = 'signup',
  VALIDATE = 'validate',
  HEARTBEAT = 'heartbeat',
}

export type IncomingMessage =
  | {
      type: MessageType.SIGNUP;
      data: SignupIncomingMessage;
    }
  | {
      type: MessageType.VALIDATE;
      data: ValidateIncomingMessage;
    }
  | {
      type: MessageType.HEARTBEAT;
    };

export type OutgoingMessage =
  | {
      type: MessageType.SIGNUP;
      data: SignupOutgoingMessage;
    }
  | {
      type: MessageType.VALIDATE;
      data: ValidateOutgoingMessage;
    };

export const SIGNINMESSAGE = (publicKey: string) =>
  `Sign in to DPIN Uptime Monitor\nWallet: ${publicKey}`;

export const VALIDATE_SIGNUP_MESSAGE = (
  callbackId: string,
  publicKey: string
) => `Signed message for ${callbackId}, ${publicKey}`;

export const REPLY_MESSAGE = (callbackId: string) =>
  `Replying to ${callbackId}`;
