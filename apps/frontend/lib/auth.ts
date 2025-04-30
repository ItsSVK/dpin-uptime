'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthPayload {
  userId: string;
  walletAddress: string;
  signature: string;
}

export async function signJWT(payload: AuthPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: COOKIE_MAX_AGE,
  });
}

async function updateCookie(token: string | null): Promise<void> {
  const cookieStore = await cookies();

  if (!token) {
    cookieStore.delete(COOKIE_NAME);
    return;
  }

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return;
}

export async function setAuthCookie(token: string): Promise<void> {
  await updateCookie(token);
}

export async function clearAuthCookie(): Promise<void> {
  await updateCookie(null);
}

export async function getUserFromJWT(): Promise<AuthPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (err) {
    console.error('Invalid JWT:', err);
    return null;
  }
}

export async function isCookieValid(address: string): Promise<boolean> {
  const user = await getUserFromJWT();
  if (!user) return false;
  const { walletAddress } = user;
  return walletAddress === address;
}
