import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction as SolanaTransaction, // Alias to avoid conflict if any local 'Transaction' type exists
} from '@solana/web3.js';
import { prismaClient } from 'db/client';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { connection } from 'common';
import {
  maxRetries,
  transactionTimeout,
  maxConcurrentProcessing,
  pollingInterval, // For the main loop interval
} from '@/src/config';
import {
  processingTransactions,
  setPollerHealth,
  updateLastSuccessfulPoll,
  isPollerHealthy, // For read access within the loop
} from '@/src/state';
import { checkRateLimit, isTransactionStuck } from '@/src/utils';

async function recoverStuckTransactions() {
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
}

async function processTransactionsCycle() {
  try {
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
      if (processingTransactions.has(txn.id)) continue;

      try {
        processingTransactions.add(txn.id);
        await checkRateLimit();

        const onChainTransaction = await connection.getTransaction(
          txn.signature,
          {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 0,
          }
        );

        await prismaClient.transaction.update({
          where: { id: txn.id },
          data: { lastCheckedAt: new Date() },
        });

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
                data: { processingPayout: false },
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

        if (onChainTransaction.meta?.err === null) {
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
          if (txn.retryCount >= maxRetries) {
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
                  data: { processingPayout: false },
                });
              }
            });
            console.warn(
              `❌ Transaction ${txn.signature} failed after max retries.`
            );
          } else {
            const backoffDelay = Math.pow(2, txn.retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            try {
              const { publicKey, secretKey } = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(process.env.SOLANA_KEYPAIR!))
              );
              const solanaTransaction = new SolanaTransaction().add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: new PublicKey(txn.validator?.publicKey || ''),
                  lamports: Number(txn.amount), // Ensure lamports is number
                })
              );
              const signer = Keypair.fromSecretKey(secretKey);
              await checkRateLimit();
              const newSignature = await sendAndConfirmTransaction(
                connection,
                solanaTransaction,
                [signer]
              );
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
                    data: { processingPayout: false },
                  });
                }
              });
            }
          }
        }
      } catch (e) {
        console.error(`Error processing transaction ${txn.id}:`, e);
      } finally {
        processingTransactions.delete(txn.id);
      }
    }
    updateLastSuccessfulPoll();
    setPollerHealth(true);
  } catch (error) {
    console.error('Fatal error in transaction processing cycle:', error);
    setPollerHealth(false);
  }
}

let transactionPollingInterval: NodeJS.Timeout | null = null;

export const startTransactionPolling = () => {
  if (transactionPollingInterval) {
    console.log('Transaction polling is already running.');
    return;
  }
  console.log('Starting transaction processor...');
  transactionPollingInterval = setInterval(async () => {
    if (!isPollerHealthy) {
      console.log(
        '🔄 Poller unhealthy, attempting to recover by clearing processing set...'
      );
      processingTransactions.clear();
      // Optionally, wait a bit before retrying to let things settle
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    await processTransactionsCycle().catch(error => {
      console.error('Unhandled error in processTransactionsCycle:', error);
      setPollerHealth(false); // Ensure health is set to false on unhandled cycle error
    });
  }, pollingInterval);
};

export const stopTransactionPolling = () => {
  if (transactionPollingInterval) {
    clearInterval(transactionPollingInterval);
    transactionPollingInterval = null;
    console.log('Transaction processor stopped.');
  }
};
