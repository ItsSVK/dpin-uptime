import { randomUUIDv7 } from 'bun';
import type { OutgoingMessage, SignupOutgoingMessage } from 'common';
import { MessageType, VALIDATE_SIGNUP_MESSAGE } from 'common';
import { Keypair } from '@solana/web3.js';
import { signMessage } from '@/src/utils/crypto';
import { validateHandler } from '@/src/messageHandlers';
import { CALLBACKS, setValidatorId } from '@/src/state';

let wsInstance: WebSocket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const BASE_RECONNECT_DELAY = 5000; // 5 seconds

function scheduleReconnect(keypair: Keypair) {
  if (reconnectTimeout) return; // Prevent multiple concurrent reconnects
  reconnectAttempts++;
  const delay = Math.min(
    BASE_RECONNECT_DELAY * reconnectAttempts,
    MAX_RECONNECT_DELAY
  );
  console.log(
    `Reconnecting to DPIN Hub in ${delay / 1000}s (attempt ${reconnectAttempts})...`
  );
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectToHub(keypair);
  }, delay);
}

export function connectToHub(keypair: Keypair) {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    console.log('Already connected to DPIN Hub.');
    return;
  }

  const hubUrl = process.env.HUB_URL! || 'wss://dpin-hub.itssvk.dev/ws/';
  console.log(`Connecting to DPIN Hub at ${hubUrl}...`);
  wsInstance = new WebSocket(hubUrl);

  wsInstance.onopen = async () => {
    console.log('Connected to DPIN Hub, signing up');
    reconnectAttempts = 0; // Reset on successful connection
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    const callbackId = randomUUIDv7();
    CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
      setValidatorId(data.validatorId);
      console.log(`Signed up with Validator ID: ${data.validatorId}`);
    };

    const signedMessage = await signMessage(
      VALIDATE_SIGNUP_MESSAGE(callbackId, keypair.publicKey.toBase58()),
      keypair
    );

    wsInstance?.send(
      JSON.stringify({
        type: MessageType.SIGNUP,
        data: {
          callbackId,
          publicKey: keypair.publicKey.toBase58(), // Ensure public key is string
          signedMessage,
        },
      })
    );
  };

  wsInstance.onmessage = async event => {
    try {
      const messageData =
        typeof event.data === 'string'
          ? event.data
          : Buffer.from(event.data as ArrayBuffer).toString('utf8');
      const data: OutgoingMessage = JSON.parse(messageData);

      if (data.type === MessageType.SIGNUP) {
        if (CALLBACKS[data.data.callbackId]) {
          CALLBACKS[data.data.callbackId]?.(data.data);
          delete CALLBACKS[data.data.callbackId];
        }
      } else if (data.type === MessageType.VALIDATE && wsInstance) {
        await validateHandler(wsInstance, data.data, keypair);
      }
    } catch (error) {
      console.error('Error processing message from hub:', error);
      if (typeof event.data === 'string') {
        console.error('Raw message data:', event.data);
      } else {
        console.error('Raw message data type:', typeof event.data);
      }
    }
  };

  wsInstance.onerror = event => {
    console.error('Error from hub:', event);
    scheduleReconnect(keypair);
  };

  wsInstance.onclose = () => {
    console.log('Disconnected from hub');
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    scheduleReconnect(keypair);
  };

  // Clear any existing heartbeat interval before setting a new one
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      console.log('Sending heartbeat to hub');
      wsInstance.send(JSON.stringify({ type: MessageType.HEARTBEAT }));
    } else {
      console.warn(
        'WebSocket not open, skipping heartbeat. Attempting to reconnect or will exit on next close event.'
      );
      // If not open, the onclose handler should eventually trigger process.exit or reconnection.
      // Alternatively, could try to force a reconnect here if it's stuck in a non-OPEN, non-CLOSED state.
      scheduleReconnect(keypair);
    }
  }, 10000);

  return wsInstance;
}

export function getWebSocketInstance(): WebSocket | null {
  return wsInstance;
}
