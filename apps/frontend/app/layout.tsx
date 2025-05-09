import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { LayoutWraper } from '@/components/pages/LayoutWraper';
import Provider from '@/providers/provider';

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
        <Provider>
          <div className="flex min-h-screen flex-col bg-black text-white">
            <Navbar />
            <LayoutWraper>{children}</LayoutWraper>
          </div>
        </Provider>
      </body>
    </html>
  );
}
