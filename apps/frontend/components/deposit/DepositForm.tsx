'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, DollarSign, Info } from 'lucide-react';

const DepositForm = () => {
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-500" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-emerald-400">0.00 SOL</p>
              <p className="text-sm text-zinc-400">Available for monitoring</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Deposit Form Card */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Make a Deposit
          </CardTitle>
          <CardDescription>
            Add funds to keep your websites monitored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-zinc-300"
            >
              Amount (SOL)
            </label>
            <div className="relative">
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0.1"
                step="0.1"
                placeholder="0.00"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-zinc-500">SOL</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Minimum deposit: 0.1 SOL</p>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            Connect Wallet to Deposit
          </Button>

          {/* Info Section */}
          <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 mt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-300">
                  About Website Monitoring
                </h4>
                <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Monitoring costs 0.000001 SOL per check</li>
                  <li>Funds are used automatically for monitoring</li>
                  <li>Monitoring pauses if balance drops below 0.1 SOL</li>
                  <li>Deposit any amount to resume monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Card */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No recent transactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositForm;
