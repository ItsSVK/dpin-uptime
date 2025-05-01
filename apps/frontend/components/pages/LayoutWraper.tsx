'use client';
import { Footer } from '../Footer';
import { usePathname } from 'next/navigation';
import { publicRoutes } from '@/lib/websiteUtils';

export function LayoutWraper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      {publicRoutes.includes(pathname) && <Footer />}
    </>
  );
}
