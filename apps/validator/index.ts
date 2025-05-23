import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { connectToHub } from '@/src/websocketClient';
import { serve } from 'bun';

// CALLBACKS and validatorId are now managed in @/src/state.ts
// WebSocket event handlers (onopen, onmessage, onerror, onclose) and heartbeat are in @/src/websocketClient.ts
// signMessage is in @/src/utils/crypto.ts
// checkURL is in @/src/urlChecker.ts
// validateHandler is in @/src/messageHandlers.ts

// Removed imports: randomUUIDv7, OutgoingMessage, SignupOutgoingMessage, MessageType,
// VALIDATE_SIGNUP_MESSAGE, REPLY_MESSAGE (used by moved functions)

async function main() {
  if (!process.env.PRIVATE_KEY) {
    console.error('FATAL: PRIVATE_KEY environment variable is not set.');
    process.exit(1);
  }
  try {
    const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
    console.log(`Validator Public Key: ${keypair.publicKey.toBase58()}`);
    connectToHub(keypair);
  } catch (error) {
    console.error('Failed to load keypair from PRIVATE_KEY:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error in main execution:', error);
  process.exit(1);
});

// Start healthcheck HTTP server
serve({
  port: 8080,
  fetch(req) {
    if (req.method === 'GET' && new URL(req.url).pathname === '/health') {
      return new Response(JSON.stringify({ healthy: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
});
