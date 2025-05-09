'use client';

import { WalletProvider } from '@/components/providers/WalletProvider';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from 'sonner';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WalletProvider>{children}</WalletProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}
