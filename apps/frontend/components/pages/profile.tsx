'use client';
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@civic/auth-web3/react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
  Connection,
  clusterApiUrl,
} from '@solana/web3.js';
import { toast } from 'sonner';
import {
  ArrowRight,
  Check,
  Copy,
  RotateCw,
  Send,
  User2,
  Wallet,
} from 'lucide-react';
import { connection } from 'common';
import { Spin } from '@/components/spin';
import { createTransactionRecord } from '@/actions/deposit';
import {
  Transaction as DBTransaction,
  TransactionType,
  TransactionStatus,
} from '@prisma/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage({
  transactions,
}: {
  transactions: DBTransaction[];
}) {
  const { address, appUser, signOut, isLoading, isSigningOut } = useAuth();
  const { wallet } = useWallet({ type: 'solana' });
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const router = useRouter();

  const updateBalance = useCallback(async () => {
    setUpdatingBalance(true);
    if (!address) {
      setSolBalance(0);
      return;
    }
    const bal = await connection.getBalance(new PublicKey(address));
    setSolBalance(bal / LAMPORTS_PER_SOL);
    setUpdatingBalance(false);
  }, [address]);

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      try {
        await updateBalance();
      } catch {
        setSolBalance(0);
      }
    }
    fetchBalance();
  }, [address]);

  useEffect(() => {
    const interval = setInterval(async () => {
      router.refresh();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!wallet || !address) {
      setError('Connect your wallet');
      return;
    }
    if (!recipient || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid recipient and amount');
      return;
    }

    try {
      new PublicKey(recipient);
    } catch {
      setError('Please enter a valid Solana address');
      return;
    }
    try {
      setLoading(true);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await wallet.sendTransaction(transaction, connection);

      await createTransactionRecord({
        signature,
        transactionType: TransactionType.TRANSFER,
      });
      setAmount('');
      setRecipient('');
      toast.success('Processing transaction ...');
      updateBalance();
      router.refresh();
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Transfer failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <Card className="w-full md:w-1/3 border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex flex-col items-center p-6">
          <Avatar className="h-20 w-20 mb-4 bg-emerald-600">
            <AvatarImage src={appUser?.picture} alt={appUser?.name} />
            <AvatarFallback>
              {appUser?.name?.charAt(0) || <User2 />}
            </AvatarFallback>
          </Avatar>
          <CardHeader className="items-center">
            <CardTitle className="text-xl font-bold text-emerald-400">
              {appUser?.name || 'User'}
            </CardTitle>
            <p className="text-zinc-400 text-sm">{appUser?.email}</p>
            <span className="flex items-center justify-center gap-2 bg-zinc-800 rounded-md p-2 mt-2">
              <p className="text-zinc-400 text-xs">
                {address
                  ? `${address.slice(0, 10)}.....${address.slice(-10)}`
                  : 'No wallet connected'}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-zinc-800 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(address || '');

                  const copyButton = document.getElementById(
                    'copy-button'
                  ) as HTMLButtonElement;
                  const checkButton = document.getElementById(
                    'check-button'
                  ) as HTMLButtonElement;
                  copyButton.classList.add('hidden');
                  checkButton.classList.remove('hidden');

                  setTimeout(() => {
                    if (copyButton) {
                      copyButton.classList.remove('hidden');
                    }
                    if (checkButton) {
                      checkButton.classList.add('hidden');
                    }
                  }, 500);
                }}
              >
                <div className="copy-button-content">
                  <Copy id="copy-button" className="h-3 w-3" />
                  <Check id="check-button" className="h-3 w-3 hidden" />
                </div>
              </Button>
            </span>
            {/* Wallet Balance */}
            <div className="flex items-center gap-2 mt-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <div className="flex items-center gap-1">
                <span className="text-emerald-400 font-semibold text-base">
                  {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '—'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-zinc-800 cursor-pointer"
                  onClick={() => updateBalance()}
                  disabled={updatingBalance}
                >
                  <RotateCw
                    className={`h-3 w-3 ${updatingBalance ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-none cursor-pointer"
                disabled={!address || airdropLoading}
                onClick={async () => {
                  if (!address) return;
                  setAirdropLoading(true);
                  try {
                    const conn = new Connection(clusterApiUrl('devnet'));
                    const sig = await conn.requestAirdrop(
                      new PublicKey(address),
                      LAMPORTS_PER_SOL
                    );
                    await conn.confirmTransaction(sig, 'confirmed');
                    toast.success('Airdrop successful!');
                  } catch (err: Error | unknown) {
                    if (
                      err instanceof Error &&
                      JSON.stringify(err.message).includes('429')
                    ) {
                      toast.error(
                        'Airdrop limit reached, please try after some time'
                      );
                    } else {
                      const errorMessage =
                        err instanceof Error ? err.message : 'Unknown error';
                      toast.error('Airdrop failed: ' + errorMessage);
                    }
                  } finally {
                    setAirdropLoading(false);
                    await updateBalance();
                    router.refresh();
                  }
                }}
              >
                {airdropLoading ? <Spin className="h-4 w-4" /> : 'Airdrop'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center mt-2">
            <Button
              variant="outline"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-none cursor-pointer"
              onClick={() => signOut?.()}
              disabled={isLoading || isSigningOut}
            >
              {isSigningOut ? <Spin className="ml-4" /> : 'Sign Out'}
            </Button>
          </CardContent>
        </Card>
        {/* Transfer Card */}
        <Card className="w-full md:w-2/3 border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-emerald-400">
              <Send className="h-5 w-5 text-emerald-500" />
              Send SOL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label
                  htmlFor="recipient"
                  className="text-sm font-medium text-zinc-300"
                >
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="Enter Solana address"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 mt-1"
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-zinc-300"
                >
                  Amount (SOL)
                </label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={e => {
                    if (/^\d*\.?\d*$/.test(e.target.value))
                      setAmount(e.target.value);
                  }}
                  placeholder="0.00"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 mt-1"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center gap-2">
                    Send <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Transfer History */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-emerald-400">
            <Send className="h-5 w-5 text-emerald-500" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No transfers yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {transactions &&
                transactions.map((t, i) => {
                  const toPubkey = JSON.parse(
                    JSON.stringify(t.instructionData)
                  ).toPubkey;
                  const signature = t.signature;
                  const status = t.status;
                  const time = new Date(t.createdAt).toLocaleString();
                  return (
                    <li
                      key={signature || i}
                      className="py-4 flex flex-col gap-2"
                    >
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
                              <a
                                href={`https://explorer.solana.com/tx/${signature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
                                target="_blank"
                                className="hover:underline hover:text-emerald-300"
                              >
                                {signature?.slice(0, 8)}...
                                {signature?.slice(-8)}
                              </a>
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
                            <span className="text-xs text-zinc-400">Time</span>
                            <span className="text-xs text-zinc-300">
                              {time}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-zinc-400">Amount</span>
                          <span className="text-emerald-400 font-bold text-base">
                            -{Number(t.amount) / LAMPORTS_PER_SOL} SOL
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
  );
}
