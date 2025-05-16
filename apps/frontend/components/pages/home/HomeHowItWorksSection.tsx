'use client';
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LucideWaves, ServerOff } from 'lucide-react';
import { PulseAnimation } from '@/components/pulse-animation';

const HomeHowItWorksSection: React.FC = () => (
  <section className="py-20 md:py-32 bg-zinc-950">
    <div className="container mx-auto max-w-full px-4 md:px-6">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          How dpin works
        </h2>
        <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
          Simple setup, powerful monitoring, instant alerts
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950">
              <LucideWaves className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle>1. Add your site</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your website URL and set your preferred monitoring interval
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950">
              <PulseAnimation className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle>2. Monitor performance</CardTitle>
            <CardDescription className="text-zinc-400">
              Track uptime, response time and server performance 24/7
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950">
              <ServerOff className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle>3. Get instant alerts</CardTitle>
            <CardDescription className="text-zinc-400">
              Receive notifications the moment your site experiences issues
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  </section>
);

export default HomeHowItWorksSection;
