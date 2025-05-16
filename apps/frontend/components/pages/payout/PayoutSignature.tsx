'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PayoutSignatureProps {
  signature: string;
}

const PayoutSignature: React.FC<PayoutSignatureProps> = ({ signature }) => {
  return (
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
                title="Click to copy signature"
              >
                {signature.slice(0, 8)}...{signature.slice(-8)}
              </p>
            </div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
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
  );
};

export default PayoutSignature;
