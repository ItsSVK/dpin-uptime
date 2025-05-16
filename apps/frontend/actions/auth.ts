'use server';
import { prismaClient } from 'db/client';
import { getUser } from '@civic/auth-web3/nextjs';

export async function getOrCreateDBUser(walletAddress: string) {
  const user = await getUser();
  if (!user) return null;
  let dbUser = await getDBUser(walletAddress);
  if (!dbUser) {
    dbUser = await prismaClient.user.create({
      data: {
        walletAddress,
        email: user.email,
        id: user.id,
      },
    });
  }
  return dbUser;
}

async function getDBUser(walletAddress: string) {
  const user = await prismaClient.user.findUnique({
    where: { walletAddress },
  });
  return user;
}
