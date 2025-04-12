export interface SignupIncomingMessage {
  ip: string;
  publicKey: string;
  signedMessage: string;
  callbackId: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface ValidateIncomingMessage {
  callbackId: string;
  signedMessage: string;
  statusCode: number;
  latency: number;
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
