'use server';

import { prismaClient } from '../../../packages/db/prisma/migrations/src';
import { getUserFromJWT } from '@/lib/auth';
import { TransactionStatus, TransactionType, User } from '@prisma/client';
import { getParsedTransferDetails } from '@/lib/utils';

export async function getUserBalance() {
  const user = await getUserFromJWT();
  if (!user) return { success: false, message: 'Unauthorized' };
  const dbUser = await prismaClient.user.findUnique({
    where: { walletAddress: user.walletAddress },
    select: { currentBalance: true },
  });
  if (!dbUser) return { success: false, message: 'User not found' };
  return { success: true, balance: dbUser.currentBalance };
}

export async function getUserDeposits() {
  const user = await getUserFromJWT();
  if (!user) return { success: false, message: 'Unauthorized' };

  const dbUser = await prismaClient.user.findUnique({
    where: { walletAddress: user.walletAddress },
  });
  if (!dbUser) return { success: false, message: 'User not found' };

  const deposits = await prismaClient.transaction.findMany({
    where: {
      userId: dbUser!.id,
      transactionType: TransactionType.DEPOSIT,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return { success: true, deposits };
}

export async function createTransactionRecord({
  signature,
  transactionType,
}: {
  signature: string;
  transactionType: TransactionType;
}) {
  // get transaction from signature
  const result = await getParsedTransferDetails(signature);
  if (!result.success) return result;
  const { transfers } = result.data!;
  const fromPubkey = transfers[0].sender;
  const toPubkey = transfers[0].receiver;
  const amount = transfers[0].amount;
  if (!fromPubkey || !toPubkey)
    return { success: false, message: 'Transaction data is invalid' };
  let dbUser: User | null;
  if (transactionType === TransactionType.DEPOSIT) {
    // Update user balance and create deposit record
    dbUser = await prismaClient.user.findUnique({
      where: { walletAddress: fromPubkey },
    });
    if (!dbUser) {
      dbUser = await prismaClient.user.create({
        data: {
          walletAddress: fromPubkey,
        },
      });
    }
  }
  await prismaClient.transaction.create({
    data: {
      userId: dbUser!?.id,
      amount,
      signature,
      transactionType,
      status: TransactionStatus.Pending,
      instructionData: {
        fromPubkey: fromPubkey,
        toPubkey: toPubkey,
        lamports: Number(amount),
      },
      validatorId: null,
    },
  });
  return { success: true };
}
