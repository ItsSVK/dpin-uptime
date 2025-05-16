'use client';

import Link from 'next/link';
import {
  Check,
  ChevronRight,
  LucideWaves,
  ServerOff,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AnimatedPing } from '@/components/animated-ping';
import { PulseAnimation } from '@/components/pulse-animation';
import { TrackedSite } from '@/components/tracked-site';
import { BackgroundGradient } from '@/components/background-gradient';
import { TextGenerateEffect } from '@/components/text-generate-effect';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';

// Add this style tag at the top level of the page to ensure smooth scrolling
<style jsx global>{`
  html {
    scroll-behavior: smooth;
  }
`}</style>;

export default function Home() {
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
  const router = useRouter();

  const { appUser } = useAuth();

  const hanldeGettingStarted = useCallback(() => {
    const el = document.getElementById('home');
    if (el) {
      const signInButton = document.getElementById('sign-in-button');
      if (signInButton) {
        el.scrollIntoView({ behavior: 'smooth' });
        signInButton.click();
      }
    }
  }, []);

  return (
    <main className="min-h-[calc(100vh-135px)]">
      {/* Hero Section */}
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
                    <Link href="/dashboard">Continue to Dashboard</Link>
                  </Button>
                ) : (
                  <></>
                )}
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

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto max-w-full px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Next-level website monitoring
            </h2>
            <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
              dpin provides comprehensive uptime monitoring to keep your
              websites and services running smoothly.
            </p>
          </div>
          <div className="mx-auto mt-16 grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2"
              >
                <div className="flex h-full flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-200">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
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
                  Enter your website URL and set your preferred monitoring
                  interval
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto max-w-full px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
              Only pay for what you use. No monthly fees, no hidden costs.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="items-center">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
                  <Wallet className="h-7 w-7 text-emerald-500" />
                  Pay-as-you-go Wallet
                </CardTitle>
                <CardDescription className="mt-2 text-zinc-400 text-center">
                  Deposit SOL to your account and only pay for the monitoring
                  you use.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-2">
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-base">
                  <li>
                    <span className="font-semibold text-emerald-400">
                      0.000001 SOL
                    </span>{' '}
                    + platform fee per website check
                  </li>
                  <li>
                    <span className="font-semibold text-emerald-400">
                      No monthly subscription
                    </span>{' '}
                    — deposit any amount, anytime
                  </li>
                  <li>
                    Monitoring{' '}
                    <span className="font-semibold text-emerald-400">
                      pauses automatically
                    </span>{' '}
                    if your balance drops below{' '}
                    <span className="font-semibold">0.1 SOL</span>
                  </li>
                  <li>Instantly resume by topping up your balance</li>
                </ul>
                <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 mt-4 text-zinc-400 text-sm">
                  <span className="font-semibold text-emerald-400">
                    Example:
                  </span>{' '}
                  Monitoring 5 websites every 60 seconds for a month costs less
                  than <span className="font-semibold">0.022 SOL</span>.
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold"
                >
                  <Link href="/sign">Deposit SOL &amp; Start Monitoring</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="container mx-auto max-w-full px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to start monitoring?
            </h2>
            <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
              Join thousands of developers and businesses who trust dpin for
              their website monitoring.
            </p>
            <div className="mt-8 flex flex-col gap-2 min-[400px]:flex-row">
              {!appUser ? (
                <Button
                  size="lg"
                  className="group bg-emerald-600 hover:bg-emerald-700 font-semibold cursor-pointer"
                  onClick={hanldeGettingStarted}
                >
                  Get started now
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="group bg-zinc-800 hover:bg-zinc-700 font-semibold cursor-pointer"
                  onClick={() => router.push('/dashboard')}
                >
                  Continue to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
