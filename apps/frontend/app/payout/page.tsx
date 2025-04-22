'use client';
import React, { useState } from 'react';
import { ExternalLink, Wallet2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Loader from '@/components/status/Loader';
import { claimPayout, getPayout } from '@/actions/payout';
import { toast } from 'sonner';
import { BackgroundGradient } from '@/components/background-gradient';

function App() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const handleGetPayout = async () => {
    setLoading(true);
    const payout = await getPayout(address);
    if (!payout.success) {
      toast.error(payout.message);
      setAmount(null);
    } else {
      toast.success(payout.message);
      setAmount(
        payout.payout?.pendingPayouts
          ? (payout.payout.pendingPayouts / 10 ** 9).toFixed(9)
          : null
      );
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    setLoading(true);
    const claim = await claimPayout(address);
    if (claim.success) {
      toast.success(claim.message);
      setSignature(claim.signature as string);
      setAmount(null);
      setAddress('');
    } else {
      toast.error(claim.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-background flex items-center justify-center p-4 flex-1">
      <BackgroundGradient />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="relative overflow-hidden border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 animate-shimmer pointer-events-none" />
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="flex justify-center"
            >
              <Wallet2 className="h-12 w-12 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl">Solana Payout Portal</CardTitle>
            <CardDescription>
              Check and claim your accumulated rewards
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  setAmount(null);
                }}
                placeholder="Enter your Solana address"
                className="border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0"
              />
            </div>

            {!amount ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleGetPayout}
                  disabled={!address || loading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader />
                      Processing...
                    </span>
                  ) : (
                    'Get Accumulated Payout'
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Available Balance
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {amount} SOL
                    </p>
                  </CardContent>
                </Card>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleClaim}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  >
                    {loading ? 'Processing Claim...' : 'Claim Rewards'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Make sure to enter a valid Solana address to check your rewards
        </p>

        {signature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-muted/30 backdrop-blur-sm border-primary/20 mt-14">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Transaction Complete
                    </p>
                    {/* add click to copy functionality, also add a tooltip */}
                    <p
                      className="text-sm font-mono text-primary hover:text-primary/80 truncate cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(signature);
                        toast.success('Signature copied to clipboard');
                      }}
                    >
                      {signature.slice(0, 8)}...{signature.slice(-8)}
                    </p>
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${signature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View in Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
