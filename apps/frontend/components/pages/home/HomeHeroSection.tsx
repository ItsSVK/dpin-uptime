'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackgroundGradient } from '@/components/background-gradient';
import { TrackedSite } from '@/components/tracked-site';
import { AnimatedPing } from '@/components/animated-ping';
import { TextGenerateEffect } from '@/components/text-generate-effect';
import { BaseUser } from '@/hooks/useAuth';

interface HomeHeroSectionProps {
  appUser: BaseUser | null;
}

const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({ appUser }) => {
  return (
    <section id="home" className="relative overflow-hidden py-20 md:py-32">
      <BackgroundGradient />
      <div className="container relative z-10 mx-auto md:max-w-[calc(100%-15%)] px-12 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_450px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center rounded-lg bg-zinc-800/60 px-3 py-1 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="ml-2">Monitoring made simple</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <TextGenerateEffect words="Never miss a moment when your site goes down" />
              </h1>
              <p className="max-w-[600px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                DPIN monitors your websites 24/7, alerting you instantly when
                they&apos;re down. Get detailed uptime stats and performance
                metrics.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {appUser ? (
                <Button
                  asChild
                  className=" bg-zinc-800 hover:bg-zinc-700 font-semibold"
                >
                  <Link href="/dashboard" prefetch={true}>
                    Continue to Dashboard
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md rounded-xl bg-zinc-900 p-4 shadow-2xl">
              <div className="absolute -right-2 -top-2">
                <AnimatedPing />
              </div>
              <div className="space-y-4">
                <TrackedSite
                  name="example.com"
                  status="up"
                  uptimePercentage={99.98}
                  responseTime={187}
                />
                <TrackedSite
                  name="yoursite.com"
                  status="up"
                  uptimePercentage={100}
                  responseTime={142}
                />
                <TrackedSite
                  name="clientwebsite.org"
                  status="down"
                  uptimePercentage={92.64}
                  responseTime={0}
                  downtime="3 mins ago"
                />
                <TrackedSite
                  name="api.service.com"
                  status="up"
                  uptimePercentage={99.76}
                  responseTime={214}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
