import { SystemProgram } from '@solana/web3.js';
import { clsx, type ClassValue } from 'clsx';
import { connection } from 'common';
import { twMerge } from 'tailwind-merge';
import { Region } from '@prisma/client';

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

export const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Helper for user-friendly region names
export const REGION_LABELS: Record<Region, string> = {
  US_EAST: 'US East',
  US_WEST: 'US West',
  US_CENTRAL: 'US Central',
  CANADA_EAST: 'Canada East',
  CANADA_WEST: 'Canada West',
  EUROPE_WEST: 'Europe West',
  EUROPE_EAST: 'Europe East',
  EUROPE_NORTH: 'Europe North',
  EUROPE_SOUTH: 'Europe South',
  INDIA: 'India',
  JAPAN: 'Japan',
  SOUTH_KOREA: 'South Korea',
  TAIWAN: 'Taiwan',
  CHINA_MAINLAND: 'China Mainland',
  HONG_KONG: 'Hong Kong',
  SINGAPORE: 'Singapore',
  SOUTHEAST_ASIA: 'Southeast Asia',
  AUSTRALIA: 'Australia',
  OCEANIA: 'Oceania',
  BRAZIL: 'Brazil',
  SOUTH_AMERICA_WEST: 'South America West',
  SOUTH_AMERICA_EAST: 'South America East',
  MEXICO: 'Mexico',
  CENTRAL_AMERICA: 'Central America',
  SOUTH_AFRICA: 'South Africa',
  AFRICA_NORTH: 'Africa North',
  AFRICA_WEST: 'Africa West',
  AFRICA_EAST: 'Africa East',
  MIDDLE_EAST: 'Middle East',
  RUSSIA: 'Russia',
};
