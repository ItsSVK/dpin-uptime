'use client';
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { BaseUser } from '@/hooks/useAuth';

const HomePricingSection: React.FC<{
  appUser: BaseUser | null;
  hanldeGettingStarted: () => void;
}> = ({ appUser, hanldeGettingStarted }) => (
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
              Deposit SOL to your account and only pay for the monitoring you
              use.
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
              <span className="font-semibold text-emerald-400">Example:</span>{' '}
              Monitoring 5 websites every 60 seconds for a month costs less than{' '}
              <span className="font-semibold">0.022 SOL</span>.
            </div>
          </CardContent>
          <CardFooter>
            {!appUser && (
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold cursor-pointer"
                onClick={hanldeGettingStarted}
              >
                Deposit SOL &amp; Start Monitoring
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
);

export default HomePricingSection;
