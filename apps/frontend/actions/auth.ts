'use server';
import { prismaClient } from 'db/client';
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
  let user = await prismaClient.user.findUnique({
    where: { walletAddress: publicKey },
  });
  if (!user) {
    user = await prismaClient.user.create({
      data: { walletAddress: publicKey },
    });
  }
  return user;
}
