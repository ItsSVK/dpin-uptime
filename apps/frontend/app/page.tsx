'use client';
import React from 'react';
import { Activity, Bell, Clock, Server, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SignInButton } from '@/components/auth/SignInButton';
import HomePage from '@/components/pages/HomePage';
export default function Home() {
  return <HomePage />;
}
