'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import bs58 from 'bs58';
import { ClientOnly } from './ClientOnly';
import {
  clearAuthCookie,
  isCookieValid,
  setAuthCookie,
  signJWT,
} from '@/lib/auth';

export function SignInButton() {
  return (
    <ClientOnly>
      <SignInButtonContent />
    </ClientOnly>
  );
}

function SignInButtonContent() {
  const { connected, publicKey, signMessage } = useWallet();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Check if we have valid cookies
  const hasValidCookies = Boolean(
    Cookies.get(process.env.COOKIE_NAME || 'auth-token')
  );

  useEffect(() => {
    if (publicKey) {
      (async () => {
        const isValid = await isCookieValid(publicKey?.toString() ?? '');
        if (!isValid) {
          clearAuthCookie();
          // wallet changed, redirect to wallet connect page
          router.push('/sign');
        } else {
          setSignedIn(true);
        }
      })();
    } else if (!connected) {
      const timeout = setTimeout(() => {
        if (!connected) {
          clearAuthCookie();
          router.push('/');
        }
      }, 1500); // wait 1.5 seconds

      return () => clearTimeout(timeout);
    }
  }, [publicKey]);

  const handleSignIn = async () => {
    if (signedIn) {
      router.push('/dashboard');
      return;
    }

    if (!signMessage || !publicKey) return;

    try {
      setSigning(true);
      const messageStr = `Sign in to DPIN Uptime Monitor\nWallet: ${publicKey.toString()}`;
      const message = new TextEncoder().encode(messageStr);

      const signature = await signMessage(message);
      const signatureBase58 = bs58.encode(signature);

      const token = await signJWT({
        walletAddress: publicKey.toString(),
        signature: signatureBase58,
      });

      await setAuthCookie(token);

      // Navigate to dashboard
      setSigning(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing message:', error);
      setSigning(false);
    }
  };

  // If connected but no valid cookies, show sign button
  if (connected && !hasValidCookies) {
    return (
      <button
        onClick={handleSignIn}
        disabled={signing}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
      >
        {signing
          ? 'Signing...'
          : signedIn
            ? 'Continue to Dashboard'
            : 'Sign Message to Continue'}
      </button>
    );
  }

  // Show wallet button in all other cases
  return <WalletMultiButton />;
}
