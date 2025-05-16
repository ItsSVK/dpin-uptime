'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@civic/auth-web3/react';
import { useWallet } from '@civic/auth-web3/react';
import { useRouter } from 'next/navigation';

export type BaseUser = {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  updated_at?: Date;
};

export function useAuth() {
  const { signIn, user, signOut: originalSignOut, isLoading } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { address } = useWallet({ type: 'solana' });

  const signOut = async () => {
    setIsSigningOut(true);
    try {
      await originalSignOut();
      router.push('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    signIn,
    signOut,
    address,
    appUser: user,
    isLoading,
    isSigningOut,
  };
}
