import type { ValidateOutgoingMessage } from 'common';
import { MessageType, REPLY_MESSAGE } from 'common';
import { Keypair } from '@solana/web3.js';
import { signMessage } from '@/src/utils/crypto';
import { checkURL } from '@/src/urlChecker';
import { validatorId as currentValidatorId } from '@/src/state'; // Import validatorId

export async function validateHandler(
  ws: WebSocket, // Assuming global WebSocket type
  { url, callbackId, websiteId }: ValidateOutgoingMessage,
  keypair: Keypair
  // currentValidatorId parameter removed
) {
  console.log(`Validating ${url}`);
  const signedMessage = await signMessage(REPLY_MESSAGE(callbackId), keypair);

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
          validatorId: currentValidatorId, // Use imported validatorId
          signedMessage,
        },
      })
    );
  } catch (error) {
    // This catch block might be redundant if checkURL handles its errors and returns a structure
    // However, keeping it for safety in case checkURL itself throws an unexpected error.
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
          error: error instanceof Error ? error.message : 'N/A',
          websiteId,
          validatorId: currentValidatorId, // Use imported validatorId
          signedMessage,
        },
      })
    );
    console.error('Unexpected error in validateHandler:', error);
  }
}
