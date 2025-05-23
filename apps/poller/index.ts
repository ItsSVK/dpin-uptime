import { prismaClient } from 'db/client';
import { TransactionStatus } from '@prisma/client';
import {
  startHealthMonitoring,
  stopHealthMonitoring,
} from '@/src/healthMonitor';
import {
  startTransactionPolling,
  stopTransactionPolling,
} from '@/src/transactionProcessor';
import { processingTransactions, isPollerHealthy } from '@/src/state';
import { startAlertPolling, stopAlertPolling } from '@/src/alertProcessor';
import { serve } from 'bun';

console.log('Initializing Poller...');

startHealthMonitoring();
startTransactionPolling();
startAlertPolling();

console.log('Poller initialized and services started.');

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Cleaning up...');
  stopTransactionPolling();
  stopHealthMonitoring();
  stopAlertPolling();

  // Clean up any processing transactions
  for (const txnId of processingTransactions) {
    try {
      await prismaClient.transaction.update({
        where: { id: txnId },
        data: {
          status: TransactionStatus.Pending,
          lastCheckedAt: new Date(),
        },
      });
      console.log(
        `Marked processing transaction ${txnId} as Pending for next startup.`
      );
    } catch (error) {
      console.error(`Error cleaning up transaction ${txnId}:`, error);
    }
  }
  processingTransactions.clear();

  console.log('Cleanup finished. Exiting.');
  process.exit(0);
});

// Start healthcheck HTTP server
serve({
  port: 8080,
  fetch(req) {
    console.log('is Poller Healthy', isPollerHealthy);
    if (req.method === 'GET' && new URL(req.url).pathname === '/health') {
      return new Response(JSON.stringify({ healthy: isPollerHealthy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
});
