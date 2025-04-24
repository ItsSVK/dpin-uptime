'use client';

import Link from 'next/link';
import { Check, ChevronRight, LucideWaves, ServerOff } from 'lucide-react';
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
import { SignInButton } from '@/components/auth/SignInButton';

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

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$9',
      description: 'Perfect for small websites and personal projects',
      features: [
        '5 websites',
        '60-second checks',
        'Email alerts',
        '24-hour data retention',
      ],
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'Ideal for growing businesses with multiple sites',
      features: [
        '25 websites',
        '30-second checks',
        'SMS & Email alerts',
        '30-day data retention',
        'API access',
      ],
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'Complete solution for large organizations',
      features: [
        'Unlimited websites',
        '10-second checks',
        'Multi-channel alerts',
        '90-day data retention',
        'Priority support',
        'Custom integrations',
      ],
    },
  ];

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <BackgroundGradient />
          <div className="container relative z-10 mx-auto w-full max-w-[1800px] px-12 md:px-6">
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
                    dpin monitors your websites 24/7, alerting you instantly
                    when they&apos;re down. Get detailed uptime stats and
                    performance metrics.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SignInButton />
                  <Button variant="outline" className="hidden sm:flex">
                    View demo
                  </Button>
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
        <section className="py-20 md:py-32">
          <div className="container mx-auto w-full max-w-full px-4 md:px-6">
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
          <div className="container mx-auto w-full max-w-full px-4 md:px-6">
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
                    Receive notifications the moment your site experiences
                    issues
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto w-full max-w-full px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
                Choose the plan that fits your monitoring needs
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {pricingTiers.map((tier, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden bg-zinc-900 border-zinc-800"
                >
                  {tier.name === 'Pro' && (
                    <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 rotate-12 bg-emerald-600 px-3 py-1 text-xs font-medium">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-4 flex items-baseline text-5xl font-bold">
                      {tier.price}
                      <span className="ml-1 text-lg font-normal text-zinc-400">
                        /month
                      </span>
                    </div>
                    <CardDescription className="mt-4 text-zinc-400">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-2">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm text-zinc-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${tier.name === 'Pro' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    >
                      Get started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-zinc-950">
          <div className="container mx-auto w-full max-w-full px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to start monitoring?
              </h2>
              <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
                Join thousands of developers and businesses who trust dpin for
                their website monitoring.
              </p>
              <div className="mt-8 flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="group bg-emerald-600 hover:bg-emerald-700"
                >
                  Get started now
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg">
                  View documentation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 bg-black py-8">
        <div className="container mx-auto w-full max-w-full flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-1 text-zinc-500">
            <p className="text-center text-sm leading-loose md:text-left">
              © {new Date().getFullYear()} dpin. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
