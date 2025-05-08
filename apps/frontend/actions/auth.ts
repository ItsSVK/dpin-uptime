'use server';
import { prismaClient } from 'db/client';
import { SIGNINMESSAGE, verifySignature } from 'common';
import { User } from '@prisma/client';

export async function verifySignatureAndUpsertUser(
  signature: string,
  publicKey: string
): Promise<User | null> {
  console.log('Verifying signature and upserting user');
  console.log('point 1');
  const isValid = verifySignature(
    SIGNINMESSAGE(publicKey),
    signature,
    publicKey
  );
  console.log('point 2');
  if (!isValid) return null;
  console.log('point 3');
  const user = await prismaClient.user.findUnique({
    where: { walletAddress: publicKey },
  });
  console.log('point 4');
  if (!user) {
    console.log('point 5');
    await prismaClient.user.create({
      data: { walletAddress: publicKey },
    });
    console.log('point 6');
  }
  console.log('point 7');
  return user;
}
