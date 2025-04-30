import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { prismaClient } from 'db/client';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { connection } from 'common';
// Configuration

const maxRetries = 3;
const pollingInterval = 5000;
const transactionTimeout = 1000 * 60 * 5; // 5 minutes
const maxConcurrentProcessing = 5;
const rpcRateLimit = 10; // requests per second
const healthCheckInterval = 60000; // 1 minute

// State tracking
let isPollerHealthy = true;
let lastSuccessfulPoll = Date.now();
let processingTransactions = new Set<string>();
let rpcRequestsInLastSecond = 0;
let lastRpcReset = Date.now();

// Helper to manage RPC rate limiting
const checkRateLimit = async () => {
  const now = Date.now();
  if (now - lastRpcReset >= 1000) {
    rpcRequestsInLastSecond = 0;
    lastRpcReset = now;
  }

  if (rpcRequestsInLastSecond >= rpcRateLimit) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    rpcRequestsInLastSecond = 0;
  }
  rpcRequestsInLastSecond++;
};

// Helper to check if transaction is stuck
const isTransactionStuck = (lastCheckedAt: Date | null) => {
  if (!lastCheckedAt) return false;
  return Date.now() - lastCheckedAt.getTime() > transactionTimeout;
};

// Health monitoring
const monitorHealth = () => {
  setInterval(async () => {
    const now = Date.now();
    if (now - lastSuccessfulPoll > pollingInterval * 3) {
      isPollerHealthy = false;
      console.error(
        '⚠️ Poller health check failed - no successful polls recently'
      );

      // Alert mechanism could be added here
      // await sendAlert('Poller health check failed');

      // Try to recover
      processingTransactions.clear();
    }
  }, healthCheckInterval);
};

// Recovery helper for interrupted transactions
const recoverStuckTransactions = async () => {
  try {
    const stuckTransactions = await prismaClient.transaction.findMany({
      where: {
        status: TransactionStatus.Pending,
        lastCheckedAt: {
          lt: new Date(Date.now() - transactionTimeout),
        },
      },
    });

    for (const tx of stuckTransactions) {
      await prismaClient.$transaction(async prisma => {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            status: TransactionStatus.Failure,
            lastCheckedAt: new Date(),
          },
        });

        if (tx.transactionType === TransactionType.PAYOUT) {
          await prisma.validator.update({
            where: { id: tx.validatorId! },
            data: {
              processingPayout: false,
            },
          });
        }
      });

      console.log(`🔄 Recovered stuck transaction ${tx.id}`);
    }
  } catch (error) {
    console.error('Error recovering stuck transactions:', error);
  }
};

const pollPendingTransactions = async () => {
  try {
    // Run recovery for stuck transactions
    await recoverStuckTransactions();

    const pendingTxns = await prismaClient.transaction.findMany({
      where: {
        status: TransactionStatus.Pending,
        id: { notIn: Array.from(processingTransactions) },
      },
      include: {
        validator: true,
      },
      take: maxConcurrentProcessing,
    });

    for (const txn of pendingTxns) {
      // Skip if we're already processing this transaction
      if (processingTransactions.has(txn.id)) continue;

      try {
        processingTransactions.add(txn.id);

        // Check rate limit before making RPC call
        await checkRateLimit();

        const onChainTransaction = await connection.getTransaction(
          txn.signature,
          {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 0,
          }
        );

        // Update last checked timestamp
        await prismaClient.transaction.update({
          where: { id: txn.id },
          data: {
            lastCheckedAt: new Date(),
          },
        });

        // Check if transaction is stuck
        if (isTransactionStuck(txn.lastCheckedAt)) {
          await prismaClient.$transaction(async tx => {
            await tx.transaction.update({
              where: { id: txn.id },
              data: {
                status: TransactionStatus.Failure,
                lastCheckedAt: new Date(),
              },
            });
            if (txn.transactionType === TransactionType.PAYOUT) {
              await tx.validator.update({
                where: { id: txn.validatorId! },
                data: {
                  processingPayout: false,
                },
              });
            }
          });
          console.warn(`⏰ Transaction ${txn.signature} timed out.`);
          continue;
        }

        if (!onChainTransaction) {
          console.log(`⌛ Transaction ${txn.signature} not yet finalized.`);
          continue;
        }

        // Transaction found on chain - check status
        if (onChainTransaction.meta?.err === null) {
          // Transaction successful
          await prismaClient.$transaction(async tx => {
            await tx.transaction.update({
              where: { id: txn.id },
              data: {
                status: TransactionStatus.Success,
                lastCheckedAt: new Date(),
              },
            });
            if (txn.transactionType === TransactionType.PAYOUT) {
              await tx.validator.update({
                where: { id: txn.validatorId! },
                data: {
                  processingPayout: false,
                  pendingPayouts: { decrement: Number(txn.amount) },
                },
              });
            }
            if (txn.transactionType === TransactionType.DEPOSIT) {
              await tx.user.update({
                where: { id: txn.userId! },
                data: {
                  currentBalance: { increment: Number(txn.amount) },
                },
              });
            }
          });
          console.log(`✅ Transaction ${txn.signature} succeeded.`);
        } else {
          if (txn.transactionType === TransactionType.DEPOSIT) continue;
          // Transaction failed - handle retry logic
          if (txn.retryCount >= maxRetries) {
            // Max retries reached - mark as failed
            await prismaClient.$transaction(async tx => {
              await tx.transaction.update({
                where: { id: txn.id },
                data: {
                  status: TransactionStatus.Failure,
                  lastCheckedAt: new Date(),
                },
              });
              if (txn.transactionType === TransactionType.PAYOUT) {
                await tx.validator.update({
                  where: { id: txn.validatorId! },
                  data: {
                    processingPayout: false,
                  },
                });
              }
            });
            console.warn(
              `❌ Transaction ${txn.signature} failed after max retries.`
            );
          } else {
            // Attempt retry with exponential backoff
            const backoffDelay = Math.pow(2, txn.retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffDelay));

            try {
              const { publicKey, secretKey } = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(process.env.SOLANA_KEYPAIR!))
              );

              const transaction = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: new PublicKey(txn.validator?.publicKey || ''),
                  lamports: txn.amount,
                })
              );

              const signer = Keypair.fromSecretKey(secretKey);

              // Check rate limit before making RPC call
              await checkRateLimit();

              const newSignature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [signer]
              );

              // Create new transaction record with retry count incremented
              await prismaClient.transaction.create({
                data: {
                  validatorId: txn.validatorId,
                  transactionType: TransactionType.PAYOUT,
                  amount: txn.amount,
                  signature: newSignature,
                  retryCount: txn.retryCount + 1,
                  instructionData: {
                    fromPubkey: publicKey.toBase58(),
                    toPubkey: txn.validator?.publicKey || null,
                    lamports: Number(txn.amount),
                  },
                },
              });

              // Update old transaction as failed
              await prismaClient.transaction.update({
                where: { id: txn.id },
                data: {
                  status: TransactionStatus.Failure,
                  lastCheckedAt: new Date(),
                },
              });

              console.log(
                `🔄 Retrying transaction for validator ${txn.validatorId} - attempt ${
                  txn.retryCount + 1
                }`
              );
            } catch (retryError) {
              console.error('Error during retry:', retryError);
              // If retry fails immediately, mark as failed
              await prismaClient.$transaction(async tx => {
                await tx.transaction.update({
                  where: { id: txn.id },
                  data: {
                    status: TransactionStatus.Failure,
                    lastCheckedAt: new Date(),
                  },
                });
                if (txn.transactionType === TransactionType.PAYOUT) {
                  await tx.validator.update({
                    where: { id: txn.validatorId! },
                    data: {
                      processingPayout: false,
                    },
                  });
                }
              });
            }
          }
        }
      } catch (e) {
        console.error(`Error processing transaction ${txn.id}:`, e);
      } finally {
        // Always remove from processing set
        processingTransactions.delete(txn.id);
      }
    }

    // Update health check
    lastSuccessfulPoll = Date.now();
    isPollerHealthy = true;
  } catch (error) {
    console.error('Fatal error in poll cycle:', error);
    isPollerHealthy = false;
  }
};

// Start polling with error handling
const poll = () => {
  console.log('Starting transaction poller...');

  // Start health monitoring
  monitorHealth();

  // Start main polling loop with error handling
  setInterval(async () => {
    if (!isPollerHealthy) {
      console.log('🔄 Attempting to recover poller...');
      processingTransactions.clear();
    }
    await pollPendingTransactions().catch(error => {
      console.error('Error in polling cycle:', error);
    });
  }, pollingInterval);
};

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Cleaning up...');
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
    } catch (error) {
      console.error(`Error cleaning up transaction ${txnId}:`, error);
    }
  }
  process.exit(0);
});

poll();
