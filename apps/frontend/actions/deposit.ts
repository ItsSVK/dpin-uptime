'use server';

import { prismaClient } from 'db/client';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from '@prisma/client';
import { getParsedTransferDetails } from '@/lib/utils';
import { getUser } from '@civic/auth-web3/nextjs';

export async function getDBUserFromSession() {
  const user = await getUser();
  if (!user) return null;
  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.id },
  });
  if (!dbUser) return null;
  return dbUser;
}

export async function getUserTransactions(transactionType: TransactionType) {
  const user = await getUser();
  console.log('user', user);
  if (!user) return { success: false, message: 'Unauthorized' };

  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.id },
  });
  if (!dbUser) return { success: false, message: 'User not found' };

  const transactions: Transaction[] = await prismaClient.transaction.findMany({
    where: {
      userId: dbUser!.id,
      transactionType,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { success: true, transactions };
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
  if (
    transactionType === TransactionType.DEPOSIT ||
    transactionType === TransactionType.TRANSFER
  ) {
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

export async function getUserBalance(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;
  const dbUser = await prismaClient.user.findUnique({
    where: { id: user.id },
    select: { currentBalance: true },
  });
  if (!dbUser) return 0;
  return dbUser.currentBalance;
}
