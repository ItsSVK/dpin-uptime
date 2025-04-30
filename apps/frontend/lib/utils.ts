import { SystemProgram } from '@solana/web3.js';
import { clsx, type ClassValue } from 'clsx';
import { connection } from 'common';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getParsedTransferDetails(txSignature: string) {
  const txInfo = await connection.getParsedTransaction(txSignature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  if (!txInfo) return { success: false, message: 'Transaction not found' };

  const transfers = [];

  // Process instructions
  for (const ix of txInfo.transaction.message.instructions) {
    // Check if this is a ParsedInstruction (has 'parsed' property)
    if ('parsed' in ix) {
      // This is a ParsedInstruction

      if (
        ix.programId.toString() === SystemProgram.programId.toString() &&
        ix.parsed.type === 'transfer'
      ) {
        // System program transfer
        transfers.push({
          sender: ix.parsed.info.source,
          receiver: ix.parsed.info.destination,
          amount: ix.parsed.info.lamports,
        });
      }
    }
  }

  return { success: true, data: { transfers } };
}
