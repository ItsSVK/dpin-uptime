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
  Copy,
} from 'lucide-react';
import { useWallet } from '@civic/auth-web3/react';
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
import { WalletError } from '@solana/wallet-adapter-base';
const TREASURY_WALLET = process.env.NEXT_PUBLIC_SOLANA_KEY!;

export default function DepositForm({
  deposits,
  balance,
}: {
  deposits: PrismaTransaction[];
  balance: number;
}) {
  const { address, wallet } = useWallet({ type: 'solana' });

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      router.refresh();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  // Deposit handler
  const handleDeposit = async (e: React.FormEvent) => {
    if (!wallet) return;
    e.preventDefault();
    setError(null);
    if (!address) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0.1) {
      setError('Please enter a valid amount (minimum 0.1 SOL)');
      return;
    }
    try {
      setLoading(true);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      // Record deposit in backend
      await createTransactionRecord({
        signature,
        transactionType: TransactionType.DEPOSIT,
      });
      setAmount('');
      toast.success('Processing transaction ...');
      router.refresh();
    } catch (error) {
      toast.error(
        error == 'WalletSignTransactionError'
          ? 'Transaction declined'
          : error instanceof WalletError
            ? JSON.stringify(error.error).includes('insufficient lamports')
              ? 'Insufficient SOL balance in wallet for this transaction'
              : 'An unknown error occurred, please try again'
            : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container space-y-8 p-8 pt-6 mx-auto max-w-4xl">
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </span>
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
                  {balance !== undefined
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
            {!address ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-zinc-400">
                  Connect your wallet to deposit SOL
                </p>
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
                            0.15,
                            parseFloat(prev || '0') - 0.15
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
                            0.15,
                            parseFloat(prev || '0') + 0.15
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
            {deposits && deposits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">No recent transactions</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {deposits &&
                  deposits.map((d, i) => {
                    const toPubkey =
                      d.instructionData && typeof d.instructionData === 'object'
                        ? JSON.parse(JSON.stringify(d.instructionData)).toPubkey
                        : undefined;
                    const signature = d.signature;
                    const status = d.status;
                    const time = new Date(d.createdAt).toLocaleString();
                    return (
                      <li key={d.id || i} className="py-4 flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
                            <div className="flex flex-col">
                              <span className="text-xs text-zinc-400">To</span>
                              <span className="font-mono text-zinc-200 text-sm bg-zinc-800 rounded px-2 py-1">
                                {toPubkey
                                  ? `${toPubkey.slice(0, 6)}...${toPubkey.slice(-4)}`
                                  : '-'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-zinc-400">
                                Signature
                              </span>
                              <span className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                                <Link
                                  href={`https://explorer.solana.com/tx/${signature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
                                  target="_blank"
                                  className="hover:underline hover:text-emerald-300"
                                >
                                  {signature?.slice(0, 8)}...
                                  {signature?.slice(-8)}
                                </Link>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(signature);
                                    toast.success('Signature copied!');
                                  }}
                                >
                                  <Copy className="h-3 w-3 text-zinc-400" />
                                </Button>
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-zinc-400">
                                Status
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                  status === TransactionStatus.Pending
                                    ? 'bg-yellow-900 text-yellow-400'
                                    : status === TransactionStatus.Success
                                      ? 'bg-emerald-900 text-emerald-400'
                                      : 'bg-red-900 text-red-400'
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-zinc-400">
                                Time
                              </span>
                              <span className="text-xs text-zinc-300">
                                {time}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-zinc-400">
                              Amount
                            </span>
                            <span className="text-emerald-400 font-bold text-base">
                              +{Number(d.amount) / LAMPORTS_PER_SOL} SOL
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
