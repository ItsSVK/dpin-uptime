'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Terminal,
  DollarSign,
  Server,
  Shield,
  Star,
  TrendingUp,
} from 'lucide-react';

export default function ValidatorSignupPage() {
  return (
    <div className="container space-y-8 p-8 pt-6 mx-auto max-w-4xl">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Become a Validator
        </h1>
        <p className="text-zinc-400">
          Join the DPIN Uptime network as a validator and earn SOL for
          monitoring websites.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <CardHeader>
            <DollarSign className="h-8 w-8 text-emerald-500 mb-2" />
            <CardTitle>Earn SOL</CardTitle>
            <CardDescription>
              Get paid for each successful validation
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-emerald-500 mb-2" />
            <CardTitle>Grow Earnings</CardTitle>
            <CardDescription>
              Earn more as your reputation grows
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <CardHeader>
            <Server className="h-8 w-8 text-emerald-500 mb-2" />
            <CardTitle>Easy Setup</CardTitle>
            <CardDescription>Run with a single Docker command</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Requirements Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>A Solana wallet for receiving payments</li>
            <li>Docker installed on your machine</li>
            <li>Stable internet connection (99% uptime recommended)</li>
            <li>Server with minimum 1GB RAM and 1 CPU core</li>
            <li>Valid email address for verification</li>
          </ul>
        </CardContent>
      </Card>

      {/* Reputation System */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-500" />
            Reputation System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-300">
            Our reputation-based system rewards reliable validators. As you
            build trust, you&apos;ll unlock higher tiers with better benefits.
            Your tier is determined by your{' '}
            <span className="text-emerald-400 font-semibold">trustScore</span>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 p-4 rounded-md">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                New Validator
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>
                  • TrustScore: <span className="text-emerald-300">0 - 99</span>
                </li>
                <li>• Up to 50 checks/hour</li>
                <li>• Base payment rate</li>
                <li>• Basic monitoring</li>
              </ul>
            </div>
            <div className="bg-zinc-950 p-4 rounded-md">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                Trusted Validator
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>
                  • TrustScore:{' '}
                  <span className="text-emerald-300">100 - 499</span>
                </li>
                <li>• Up to 200 checks/hour</li>
                <li>
                  • <span className="text-emerald-300">20% bonus</span> on
                  payments
                </li>
                <li>• Priority assignments</li>
              </ul>
            </div>
            <div className="bg-zinc-950 p-4 rounded-md">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                Expert Validator
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>
                  • TrustScore: <span className="text-emerald-300">500+</span>
                </li>
                <li>• Up to 500 checks/hour</li>
                <li>
                  • <span className="text-emerald-300">50% bonus</span> on
                  payments
                </li>
                <li>• Premium assignments</li>
              </ul>
            </div>
          </div>
          <div className="bg-emerald-900/20 p-4 rounded-md border border-emerald-800">
            <h4 className="text-emerald-400 font-semibold mb-2">
              How to Level Up:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-emerald-200">
              <li>Maintain high uptime (99%+)</li>
              <li>Provide accurate validation results</li>
              <li>Complete regular validations</li>
              <li>Keep your validator software updated</li>
            </ul>
          </div>
          <div className="bg-zinc-950 p-4 rounded-md border border-emerald-800 mt-4">
            <h4 className="text-emerald-400 font-semibold mb-2">
              Low TrustScore?
            </h4>
            <p className="text-sm text-zinc-300">
              If your trustScore drops below{' '}
              <span className="text-emerald-300">-10</span>, you will be
              temporarily excluded from most validation tasks. However,
              you&apos;ll still occasionally receive recovery assignments,
              giving you a chance to improve your trustScore and regain full
              eligibility.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-500" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              1. Pull the Docker Image
            </h3>
            <div className="bg-zinc-950 p-4 rounded-md">
              <code className="text-sm text-zinc-300">
                docker pull ghcr.io/dpin-uptime/validator:latest
              </code>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              2. Run the Validator
            </h3>
            <p className="text-sm text-zinc-400 mb-2">
              Replace YOUR_SOLANA_PUBLIC_KEY with your wallet address and
              YOUR_EMAIL with your email
            </p>
            <div className="bg-zinc-950 p-4 rounded-md">
              <code className="text-sm text-zinc-300 whitespace-pre-wrap">
                docker run -d \ --name dpin-validator \ -e
                WALLET_ADDRESS=YOUR_SOLANA_PUBLIC_KEY \ -e EMAIL=YOUR_EMAIL \ -e
                HUB_URL=wss://hub.dpin.io \ ghcr.io/dpin-uptime/validator:latest
              </code>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              3. Verify Your Email
            </h3>
            <p className="text-sm text-zinc-400">
              Check your email and click the verification link to activate your
              validator
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              4. Monitor Status
            </h3>
            <div className="bg-zinc-950 p-4 rounded-md">
              <code className="text-sm text-zinc-300">
                docker logs -f dpin-validator
              </code>
            </div>
          </div>

          {/* Additional Commands */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              Additional Commands
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-md">
                <p className="text-sm text-zinc-500 mb-1">Stop validator:</p>
                <code className="text-sm text-zinc-300">
                  docker stop dpin-validator
                </code>
              </div>
              <div className="bg-zinc-950 p-4 rounded-md">
                <p className="text-sm text-zinc-500 mb-1">Restart validator:</p>
                <code className="text-sm text-zinc-300">
                  docker restart dpin-validator
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Info */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-300">
            Validators earn SOL for each successful website validation. Your
            earnings increase as your reputation grows:
          </p>
          <div className="bg-emerald-900/20 p-4 rounded-md border border-emerald-800">
            <p className="text-emerald-400 font-semibold">
              Base Rate: 0.000001 SOL per validation
            </p>
            <p className="text-sm text-emerald-500/80 mt-1">
              Trusted Validators earn{' '}
              <span className="text-emerald-300">+20%</span> and Expert
              Validators earn <span className="text-emerald-300">+50%</span> per
              validation!
            </p>
          </div>
          <div className="bg-zinc-950 p-4 rounded-md mt-4">
            <h4 className="text-sm font-medium text-zinc-300 mb-2">
              Example Monthly Earnings:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
              <li>New Validator (50/hour): 0.036 SOL</li>
              <li>Trusted Validator (200/hour, 20% bonus): 0.172 SOL</li>
              <li>Expert Validator (500/hour, 50% bonus): 0.540 SOL</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Join our community for support and discussions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button variant="outline" className="border-zinc-700">
            Discord Community
          </Button>
          <Button variant="outline" className="border-zinc-700">
            Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
