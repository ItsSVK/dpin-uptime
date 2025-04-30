'use server';
import { prismaClient } from '../../../packages/db/prisma/migrations/src';
import { SIGNINMESSAGE, verifySignature } from 'common';
import { User } from '@prisma/client';

export async function verifySignatureAndUpsertUser(
  signature: string,
  publicKey: string
): Promise<User | null> {
  const isValid = verifySignature(
    SIGNINMESSAGE(publicKey),
    signature,
    publicKey
  );
  if (!isValid) return null;

  const user = await prismaClient.user.findUnique({
    where: { walletAddress: publicKey },
  });

  if (!user) {
    await prismaClient.user.create({
      data: { walletAddress: publicKey },
    });
  }

  return user;
}
