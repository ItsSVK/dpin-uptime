'use client';
import React, { useState } from 'react';
import { BackgroundGradient } from '@/components/background-gradient';
import { motion } from 'framer-motion';
import PayoutForm from './PayoutForm';
import PayoutSignature from './PayoutSignature';

export default function PayoutPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  return (
    <div className="bg-background flex items-center justify-center p-4 flex-1">
      <BackgroundGradient />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <PayoutForm
          address={address}
          setAddress={setAddress}
          amount={amount}
          setAmount={setAmount}
          loading={loading}
          setLoading={setLoading}
          setSignature={setSignature}
        />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Make sure to enter a valid Solana address to check your rewards
        </p>
        {signature && <PayoutSignature signature={signature} />}
      </motion.div>
    </div>
  );
}
