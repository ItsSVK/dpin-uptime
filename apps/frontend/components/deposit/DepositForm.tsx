'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Info,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { createTransactionRecord } from '@/actions/deposit';

import {
  Transaction as PrismaTransaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { connection } from 'common';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const TREASURY_WALLET = process.env.NEXT_PUBLIC_SOLANA_KEY!;

export default function DepositForm({
  deposits,
  balance,
}: {
  deposits: PrismaTransaction[];
  balance: number;
}) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  // Deposit handler
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!publicKey) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0.1) {
      setError('Please enter a valid amount (minimum 0.1 SOL)');
      return;
    }
    try {
      setLoading(true);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      // Record deposit in backend
      await createTransactionRecord({
        signature,
        transactionType: TransactionType.DEPOSIT,
      });
      setAmount('');
      // startTransition(() => {}); // Refresh balance and deposits
      toast.success('Processing transaction ...');
      router.refresh();
    } catch (error) {
      // TODO: show error toast
      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container space-y-8 p-8 pt-6 mx-auto max-w-4xl">
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
          <p className="text-zinc-400">
            Manage your account balance to keep your websites monitored
          </p>
        </div>
      </div>
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
                <p className="text-3xl font-bold text-emerald-400">
                  {balance !== null
                    ? balance / LAMPORTS_PER_SOL + ' '
                    : '0.00 '}
                  SOL
                </p>
                <p className="text-sm text-zinc-400">
                  Available for monitoring
                </p>
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
            {!connected ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-zinc-400">
                  Connect your wallet to deposit SOL
                </p>
                <WalletMultiButton />
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Amount (SOL)
                  </label>
                  <div className="relative flex items-center gap-2">
                    <button
                      type="button"
                      className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md border border-zinc-700 hover:bg-zinc-700 transition"
                      onClick={() => {
                        setAmount(prev => {
                          const val = Math.max(
                            0.1,
                            parseFloat(prev || '0') - 0.1
                          );
                          return val.toFixed(2);
                        });
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <Input
                      type="text"
                      id="amount"
                      value={amount}
                      onChange={e => {
                        // Only allow numbers and dot
                        if (/^\d*\.?\d*$/.test(e.target.value))
                          setAmount(e.target.value);
                      }}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 pr-12"
                    />
                    <button
                      type="button"
                      className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md border border-zinc-700 hover:bg-zinc-700 transition"
                      onClick={() => {
                        setAmount(prev => {
                          const val = Math.max(
                            0.1,
                            parseFloat(prev || '0') + 0.1
                          );
                          return val.toFixed(2);
                        });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Minimum deposit: 0.1 SOL
                  </p>
                  {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Deposit'}
                </Button>
              </form>
            )}
            {/* Info Section */}
            <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 mt-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-300">
                    About Website Monitoring
                  </h4>
                  <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                    <li>
                      Monitoring costs 0.000001 SOL + platform fee per check
                    </li>
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
            {deposits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">No recent transactions</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {deposits.map((d, i) => (
                  <li key={d.id || i} className="py-3 flex flex-col gap-1">
                    <span className="text-zinc-100 font-medium">
                      +{Number(d.amount) / LAMPORTS_PER_SOL} SOL
                    </span>
                    <span className="text-xs text-zinc-400">
                      <Link
                        href={`https://explorer.solana.com/tx/${d.signature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`}
                        target="_blank"
                        className="text-zinc-400 hover:text-zinc-300"
                      >
                        {d.signature.slice(0, 16)}... •{' '}
                      </Link>
                      {new Date(d.createdAt).toLocaleString()}
                    </span>
                    <span
                      className={`text-xs ${
                        d.status === TransactionStatus.Pending
                          ? 'text-yellow-500'
                          : d.status === TransactionStatus.Success
                            ? 'text-emerald-500'
                            : 'text-red-500'
                      }`}
                    >
                      {d.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
