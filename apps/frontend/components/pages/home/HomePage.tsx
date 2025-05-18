'use client';
import React, { useCallback } from 'react';
import HomeHeroSection from './HomeHeroSection';
import HomeFeaturesSection from './HomeFeaturesSection';
import HomeHowItWorksSection from './HomeHowItWorksSection';
import HomePricingSection from './HomePricingSection';
import HomeCTASection from './HomeCTASection';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const features = [
  'Real-time monitoring',
  'Instant downtime alerts',
  'Response time tracking',
  'Global monitoring locations',
  'Historical uptime data',
  'Custom alert thresholds',
  'Scheduled reporting',
  'API integration',
];

export default function HomePage() {
  const router = useRouter();
  const { appUser } = useAuth();

  const hanldeGettingStarted = useCallback(() => {
    const signInButton = document.getElementById('sign-in-button');
    if (signInButton) {
      signInButton.click();
    }
  }, []);

  return (
    <main className="min-h-[calc(100vh-135px)]">
      <HomeHeroSection appUser={appUser} />
      <HomeFeaturesSection features={features} />
      <HomeHowItWorksSection />
      <HomePricingSection
        appUser={appUser}
        hanldeGettingStarted={hanldeGettingStarted}
      />
      <HomeCTASection
        appUser={appUser}
        router={router}
        hanldeGettingStarted={hanldeGettingStarted}
      />
    </main>
  );
}
