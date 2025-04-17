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
import got from 'got';
import type { WebsiteTick } from '@prisma/client';
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

async function checkURL(url: string): Promise<
  Omit<
    WebsiteTick,
    'status' | 'websiteId' | 'validatorId' | 'createdAt' | 'id'
  > & {
    statusCode: number;
  }
> {
  try {
    const response = await got(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      throwHttpErrors: false,
      timeout: {
        lookup: 5000, // DNS lookup timeout
        connect: 5000, // TCP connection timeout
        secureConnect: 5000, // TLS handshake timeout
        socket: 5000, // Socket inactivity timeout
        send: 5000, // Send timeout
        response: 10000, // Response timeout
      },
      retry: {
        limit: 0,
      },
    });

    const t = response.timings;

    const result = {
      statusCode: Number(response.statusCode),
      nameLookup: Number(((t.lookup as GLfloat) - t.start).toFixed(2)),
      connection: Number(
        ((t.connect as GLfloat) - (t.lookup as GLfloat)).toFixed(2)
      ),
      tlsHandshake: t.secureConnect
        ? Number(
            ((t.secureConnect as GLfloat) - (t.connect as GLfloat)).toFixed(2)
          )
        : 0,
      ttfb: Number(((t.response as GLfloat) - t.start).toFixed(2)),
      dataTransfer: Number(
        ((t.end as GLfloat) - (t.response as GLfloat)).toFixed(2)
      ),
      total: Number(((t.end as GLfloat) - t.start).toFixed(2)),
      error: '',
    };

    console.log(`[OK] ${url}`);
    console.table(result);

    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] ${url}: ${errorMessage}`);
    console.error(err);
    return {
      error: errorMessage,
      statusCode: 500,
      nameLookup: 0,
      connection: 0,
      tlsHandshake: 0,
      ttfb: 0,
      dataTransfer: 0,
      total: 0,
    };
  }
}

async function validateHandler(
  ws: WebSocket,
  { url, callbackId, websiteId }: ValidateOutgoingMessage,
  keypair: Keypair
) {
  console.log(`Validating ${url}`);
  const signedMessage = await signMessage(`Replying to ${callbackId}`, keypair);

  try {
    const {
      statusCode,
      nameLookup,
      connection,
      tlsHandshake,
      ttfb,
      dataTransfer,
      total,
      error,
    } = await checkURL(url);

    ws.send(
      JSON.stringify({
        type: MessageType.VALIDATE,
        data: {
          callbackId,
          statusCode,
          nameLookup,
          connection,
          tlsHandshake,
          ttfb,
          dataTransfer,
          total,
          error,
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
          statusCode: 500,
          nameLookup: 0,
          connection: 0,
          tlsHandshake: 0,
          ttfb: 0,
          dataTransfer: 0,
          total: 0,
          error: 'N/A',
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
