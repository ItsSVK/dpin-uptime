'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MonitorCheck } from 'lucide-react';
import { SignInButton } from '@/components/auth/SignInButton';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthCookie } from '@/lib/auth';
import { isCookieValid } from '@/lib/auth';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function Navbar() {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto w-full max-w-[1800px] flex h-16 items-center justify-between px-12 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <MonitorCheck className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold tracking-tighter">
            DPIN Uptime
          </span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="#"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Docs
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {pathname === '/' ? (
            <SignInButton />
          ) : (
            <WalletMultiButton className="wallet-adapter-button" />
          )}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            onClick={() => router.push('/payout')}
          >
            Payout
          </Button>
        </div>
      </div>
    </header>
  );
}
