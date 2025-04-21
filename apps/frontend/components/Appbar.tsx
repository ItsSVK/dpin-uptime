'use client';

import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/auth/ClientOnly';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@/styles/wallet.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { clearAuthCookie, isCookieValid } from '@/lib/auth';

export function Appbar() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      (async () => {
        const isValid = await isCookieValid(publicKey?.toString() ?? '');
        if (!isValid) {
          console.log('Clearing auth cookie 1');
          clearAuthCookie();
          // wallet changed, redirect to wallet connect page
          router.push('/sign');
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

  return (
    <ClientOnly>
      <div className="flex justify-between items-center p-4 bg-card border-b border-border">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => router.push('/')}
        >
          DPIN Uptime
        </div>
        <div className="flex items-center space-x-4">
          <WalletMultiButton className="wallet-adapter-button" />
        </div>
      </div>
    </ClientOnly>
  );
}
