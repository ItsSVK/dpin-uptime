'use client';

import { CivicAuthProvider } from '@civic/auth-web3/nextjs';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from 'sonner';
import { WalletProvider } from '@solana/wallet-adapter-react';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider wallets={[]}>
      <CivicAuthProvider>{children}</CivicAuthProvider>
      <Toaster position="top-right" richColors />
    </WalletProvider>
  );
}
