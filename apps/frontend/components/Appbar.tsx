'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function Appbar() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center p-4">
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => router.push('/')}
      >
        DPIN Uptime
      </div>
      <div>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
