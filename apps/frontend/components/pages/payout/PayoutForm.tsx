'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { motion } from 'framer-motion';
import { Wallet2 } from 'lucide-react';

interface PayoutFormProps {
  address: string;
  setAddress: (address: string) => void;
  amount: string | null;
  setAmount: (amount: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setSignature: (signature: string | null) => void;
}

const PayoutForm: React.FC<PayoutFormProps> = ({
  address,
  setAddress,
  amount,
  setAmount,
  loading,
  setLoading,
  setSignature,
}) => {
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
    <Card className="relative overflow-hidden border-gray-800">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 animate-shimmer pointer-events-none" />
      <CardHeader className="space-y-4 text-center">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGetPayout}
              disabled={!address || loading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader /> Processing...
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
                <p className="text-2xl font-bold text-primary">{amount} SOL</p>
              </CardContent>
            </Card>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
  );
};

export default PayoutForm;
