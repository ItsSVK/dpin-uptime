import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { LayoutWraper } from '@/components/pages/LayoutWraper';
import Provider from '@/providers/provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DPIN Uptime',
  description: 'Monitor your website uptime with DPIN',
  other: {
    gramm: 'false',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <Provider>
          <div className="flex min-h-screen flex-col bg-black text-white">
            <Navbar />
            <LayoutWraper>{children}</LayoutWraper>
          </div>
        </Provider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
