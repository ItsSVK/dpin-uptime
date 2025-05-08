import type { IncomingMessage } from 'common';
import { MessageType } from 'common';
import { CALLBACKS, VALIDATION_TIMEOUT } from '@/src/constants';

// Define a more specific type for the validator and website arguments if possible,
// for now using any as it was in the original index.ts
interface BasicValidatorInfo {
  socket: any; // Should be ServerWebSocket<unknown> ideally, but keeping it simple for now
  validatorId: string;
  // other validator props if needed by this function
}

interface BasicWebsiteInfo {
  id: string;
  url: string;
  // other website props if needed by this function
}

export async function validateWebsite(
  website: BasicWebsiteInfo,
  validator: BasicValidatorInfo,
  callbackId: string
): Promise<any> {
  // Return type was Promise<any> in original
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      delete CALLBACKS[callbackId];
      reject(new Error('Validation timeout'));
    }, VALIDATION_TIMEOUT);

    CALLBACKS[callbackId] = async (data: IncomingMessage) => {
      clearTimeout(timeoutId);
      if (data.type === MessageType.VALIDATE) {
        resolve(data);
      } else {
        reject(new Error('Invalid response type'));
      }
    };

    validator.socket.send(
      JSON.stringify({
        type: MessageType.VALIDATE,
        data: {
          url: website.url,
          callbackId,
          websiteId: website.id,
        },
      })
    );
  });
}
