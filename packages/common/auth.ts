import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
export const verifySignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  const messageStr = new TextEncoder().encode(message);
  const signatureBytes = new Uint8Array(JSON.parse(signature));
  const publicKeyBytes = new PublicKey(publicKey).toBytes();
  return nacl.sign.detached.verify(messageStr, signatureBytes, publicKeyBytes);
};
