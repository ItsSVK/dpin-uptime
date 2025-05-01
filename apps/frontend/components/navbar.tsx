'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MonitorCheck, Menu, X } from 'lucide-react';
import { SignInButton } from '@/components/auth/SignInButton';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clearAuthCookie } from '@/lib/auth';
import { isCookieValid } from '@/lib/auth';
import { useEffect, useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { publicRoutes } from '@/lib/websiteUtils';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          if (!publicRoutes.includes(window.location.pathname)) {
            console.log('Redirecting to sign in');
            router.push('/');
          }
        }
      }, 1500); // wait 1.5 seconds

      return () => clearTimeout(timeout);
    }
  }, [publicKey, connected, router]);

  const scrollToSection = useCallback((section: string, id: string) => {
    const el = document.getElementById(id);
    if (el && section == '/') {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (el) {
      const yOffset = -75; // adjust if you have a fixed header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const handleNavScroll = useCallback(
    (sectionId: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      let [section, id] = sectionId.split('#');
      if (section == '') {
        section = '/';
      } else {
        section = '/' + section;
      }
      if (id == undefined) id = '';

      if (pathname == section) {
        scrollToSection(section, id);
      } else {
        router.push(`${section}`);
        setTimeout(() => {
          scrollToSection(section, id);
        }, 800);
      }
    },
    [pathname, searchParams]
  );

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Become a Validator', href: 'validator#validator' },
    { label: 'Install DPIN', href: 'validator#install' },
  ];

  const NavButton = ({ href, label }: { href: string; label: string }) => (
    <Button
      className="text-sm font-medium text-zinc-400 transition-colors hover:text-white cursor-pointer w-full md:w-auto justify-start md:justify-center"
      onClick={e => {
        handleNavScroll(href)(e);
        setIsMobileMenuOpen(false);
      }}
    >
      {label}
    </Button>
  );

  return (
    <header className="sticky top-0 z-[100] border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto w-full max-w-[1800px] flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <MonitorCheck className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold tracking-tighter">
            DPIN Uptime
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          {navItems.map(item => (
            <NavButton key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {pathname === '/' ? (
            <SignInButton />
          ) : (
            <WalletMultiButton className="wallet-adapter-button" />
          )}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer hidden md:block"
            onClick={() => router.push('/payout')}
          >
            Payout
          </Button>

          {/* Mobile Menu Button */}
          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'fixed inset-x-0 top-[64px] z-[90] h-[calc(100vh-64px)] overflow-y-auto bg-black border-b border-zinc-800 transition-all duration-300 ease-in-out md:hidden',
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 visible'
            : '-translate-y-full opacity-0 invisible'
        )}
      >
        <nav className="container mx-auto flex flex-col gap-2 px-4 py-6">
          {navItems.map(item => (
            <NavButton key={item.href} href={item.href} label={item.label} />
          ))}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer w-full justify-start mt-4"
            onClick={() => {
              router.push('/payout');
              setIsMobileMenuOpen(false);
            }}
          >
            Payout
          </Button>
        </nav>
      </div>
    </header>
  );
}
