'use client';
import React from 'react';
import { Activity, Bell, Clock, Server, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SignInButton } from '@/components/auth/SignInButton';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          DPIN Uptime Monitor
        </h1>
        <div className="mb-8">
          <SignInButton />
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Connect your wallet and sign a message to access the dashboard and
          monitor your websites.
        </p>
      </div>
    </main>
  );
}
