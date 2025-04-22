'use client';
import React from 'react';
import { SignInButton } from '@/components/auth/SignInButton';
import { BackgroundGradient } from '@/components/background-gradient';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <BackgroundGradient />
      <div className="text-center z-10">
        <h1 className="text-4xl font-bold mb-8 text-white">
          DPIN Uptime Monitor
        </h1>
        <div className="mb-8 flex items-center justify-center cursor-pointer">
          <SignInButton />
        </div>
        <p className="text-white max-w-md mx-auto">
          Connect your wallet and sign a message to access the dashboard and
          monitor your websites.
        </p>
      </div>
    </main>
  );
}
