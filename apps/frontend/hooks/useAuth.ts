'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useWallet } from '@solana/wallet-adapter-react';
import { getUserFromJWT, clearAuthCookie } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const hasValidCookies = Boolean(
      Cookies.get(process.env.COOKIE_NAME || 'auth-token')
    );

    getUserFromJWT().then(user => {
      if (user) {
        setIsAuthenticated(
          user.walletAddress === publicKey?.toString() &&
            connected &&
            hasValidCookies &&
            Boolean(publicKey)
        );

        if (!isAuthenticated) {
          clearAuthCookie();
        }
      } else {
        setIsAuthenticated(false);
      }
    });
  }, [connected, publicKey]);

  return {
    isAuthenticated,
    walletAddress: publicKey?.toString(),
  };
}
