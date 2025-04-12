import { randomUUIDv7 } from 'bun';
import type {
  OutgoingMessage,
  SignupOutgoingMessage,
  ValidateOutgoingMessage,
} from 'common/types';
import { MessageType } from 'common/types';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import bs58 from 'bs58';

const CALLBACKS: {
  [callbackId: string]: (data: SignupOutgoingMessage) => void;
} = {};

let validatorId: string | null = null;

async function main() {
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
  const ws = new WebSocket(process.env.HUB_URL!);

  // check if the websocket is running
  ws.onopen = async () => {
    console.log('Connected to hub, signing up');
    const callbackId = randomUUIDv7();
    CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
      validatorId = data.validatorId;
    };

    const signedMessage = await signMessage(
      `Signed message for ${callbackId}, ${keypair.publicKey}`,
      keypair
    );

    ws.send(
      JSON.stringify({
        type: MessageType.SIGNUP,
        data: {
          callbackId,
          ip: '127.0.0.1',
          country: 'US',
          city: 'New York',
          latitude: 40.7128,
          longitude: -74.006,
          publicKey: keypair.publicKey,
          signedMessage,
        },
      })
    );
  };

  ws.onmessage = async event => {
    const data: OutgoingMessage = JSON.parse(event.data);
    if (data.type === MessageType.SIGNUP) {
      CALLBACKS[data.data.callbackId]?.(data.data);
      delete CALLBACKS[data.data.callbackId];
    } else if (data.type === MessageType.VALIDATE) {
      await validateHandler(ws, data.data, keypair);
    }
  };

  ws.onerror = event => {
    console.error('Error from hub:', event);
  };

  ws.onclose = () => {
    console.log('Disconnected from hub');
    process.exit(1);
  };

  // This code sends a heartbeat message to the websocket server every 10 seconds
  // to keep the connection alive and let the server know the validator is still running
  setInterval(async () => {
    console.log('Sending heartbeat');
    ws.send(JSON.stringify({ type: MessageType.HEARTBEAT }));
  }, 10000);
}

async function validateHandler(
  ws: WebSocket,
  { url, callbackId, websiteId }: ValidateOutgoingMessage,
  keypair: Keypair
) {
  console.log(`Validating ${url}`);
  const startTime = Date.now();
  const signedMessage = await signMessage(`Replying to ${callbackId}`, keypair);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const endTime = Date.now();
    const latency = endTime - startTime;
    const status = response.status;

    console.log(url);
    console.log(status);
    ws.send(
      JSON.stringify({
        type: MessageType.VALIDATE,
        data: {
          callbackId,
          status,
          latency,
          websiteId,
          validatorId,
          signedMessage,
        },
      })
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: MessageType.VALIDATE,
        data: {
          callbackId,
          status: 500,
          latency: 1000,
          websiteId,
          validatorId,
          signedMessage,
        },
      })
    );
    console.error(error);
  }
}

async function signMessage(message: string, keypair: Keypair) {
  const messageBytes = nacl_util.decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

  return JSON.stringify(Array.from(signature));
}

main();
