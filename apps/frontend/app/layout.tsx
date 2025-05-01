import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from 'sonner';
import { Footer } from '@/components/Footer';
import { LayoutWraper } from '@/components/pages/LayoutWraper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DPIN Uptime',
  description: 'Monitor your website uptime with DPIN',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <WalletProvider>
          <div className="flex min-h-screen flex-col bg-black text-white">
            <Navbar />
            <LayoutWraper>{children}</LayoutWraper>
          </div>
        </WalletProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
