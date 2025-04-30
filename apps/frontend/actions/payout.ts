'use server';

import { prismaClient } from '../../../packages/db/prisma/migrations/src';
import { TransactionType, Validator } from '@prisma/client';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { sendAndConfirmTransaction } from '@solana/web3.js';
import { connection } from 'common';

export async function getPayout(publicKey: string): Promise<{
  success: boolean;
  message: string;
  payout?: Pick<Validator, 'id' | 'pendingPayouts'> | null;
}> {
  try {
    const payout = await prismaClient.validator.findFirst({
      where: {
        publicKey,
      },
      select: {
        id: true,
        pendingPayouts: true,
        processingPayout: true,
      },
    });

    if (!payout || payout.pendingPayouts === 0) {
      return {
        success: false,
        message: 'Invalid address or have no pending payouts',
      };
    }

    if (payout.processingPayout) {
      return {
        success: false,
        message: 'A payout is already being processed, please wait',
      };
    }

    return {
      success: true,
      message: 'Payout found',
      payout,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Something went wrong, please try again later',
    };
  }
}

export async function claimPayout(address: string) {
  try {
    const payout = await prismaClient.validator.findFirst({
      where: {
        publicKey: address,
      },
      select: {
        id: true,
        pendingPayouts: true,
        processingPayout: true,
        publicKey: true,
      },
    });

    if (!payout || payout.pendingPayouts === 0) {
      return {
        success: false,
        message: 'Invalid address or have no pending payouts',
      };
    }

    const id = payout.id;

    if (payout.processingPayout) {
      return {
        success: false,
        message: 'A payout is already being processed, please wait',
      };
    }

    const { publicKey, secretKey } = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.SOLANA_KEYPAIR!))
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(payout.publicKey),
        lamports: payout.pendingPayouts,
      })
    );

    const signer = Keypair.fromSecretKey(secretKey);

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      signer,
    ]);

    await prismaClient.$transaction(async tx => {
      await tx.validator.update({
        where: { id },
        data: { processingPayout: true },
      });

      await tx.transaction.create({
        data: {
          validatorId: id,
          amount: payout.pendingPayouts,
          signature,
          transactionType: TransactionType.PAYOUT,
          instructionData: {
            fromPubkey: publicKey.toBase58(),
            toPubkey: new PublicKey(payout.publicKey).toBase58(),
            lamports: payout.pendingPayouts,
          },
        },
      });
    });

    return {
      success: true,
      message: `Payout of ${(payout.pendingPayouts / 10 ** 9).toFixed(
        9
      )} SOL sent to ${payout.publicKey}, will reflect once the transaction is finalized`,
      signature,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to claim payout',
    };
  }
}
