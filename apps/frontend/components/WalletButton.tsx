'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@/styles/wallet.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ClientOnly } from '@/components/auth/ClientOnly';

export function WalletButton() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  // Check if we have valid cookies
  const hasValidCookies = Boolean(
    Cookies.get('wallet') && Cookies.get('signature')
  );

  useEffect(() => {
    if (!connected) {
      // Only remove cookies and redirect if we had valid cookies before
      if (hasValidCookies) {
        Cookies.remove('wallet', { path: '/' });
        Cookies.remove('signature', { path: '/' });
        router.push('/');
      }
    }
  }, [connected, hasValidCookies, router]);

  return (
    <ClientOnly>
      <WalletMultiButton />
    </ClientOnly>
  );
}
