'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import bs58 from 'bs58';
import { ClientOnly } from './ClientOnly';
import { Button } from '@/components/ui/button';
import {
  clearAuthCookie,
  isCookieValid,
  setAuthCookie,
  signJWT,
} from '@/lib/auth';
import { publicRoutes } from '@/lib/websiteUtils';
import { SIGNINMESSAGE } from 'common';
import { verifySignatureAndUpsertUser } from '@/actions/auth';

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
          if (!publicRoutes.includes(window.location.pathname)) {
            console.log('Redirecting to sign in');
            router.push('/');
          }
        }
      }, 1500); // wait 1.5 seconds

      return () => clearTimeout(timeout);
    }
  }, [publicKey, connected, router]);

  const handleSignIn = async () => {
    console.log('Signing in');
    if (signedIn) {
      router.push('/dashboard');
      return;
    }

    if (!signMessage || !publicKey) return;

    try {
      setSigning(true);
      const messageStr = SIGNINMESSAGE(publicKey.toBase58());
      const message = new TextEncoder().encode(messageStr);

      const signature = await signMessage(message);

      console.log('Signature:', JSON.stringify(Array.from(signature)));
      console.log('Public key:', publicKey.toBase58());

      const user = await verifySignatureAndUpsertUser(
        JSON.stringify(Array.from(signature)),
        publicKey.toBase58()
      );

      if (!user) {
        throw new Error('Invalid signature');
      }

      const token = await signJWT({
        userId: user.id,
        walletAddress: publicKey.toBase58(),
        signature: bs58.encode(signature),
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
      <Button
        onClick={handleSignIn}
        disabled={signing}
        variant="outline"
        className="hidden sm:flex cursor-pointer"
      >
        {signing
          ? 'Signing...'
          : signedIn
            ? 'Continue to Dashboard'
            : 'Sign Message'}
      </Button>
    );
  }

  // Show wallet button in all other cases
  return <WalletMultiButton className="wallet-adapter-button-trigger" />;
}
