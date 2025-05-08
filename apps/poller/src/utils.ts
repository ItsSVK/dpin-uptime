import { rpcRateLimit, transactionTimeout } from '@/src/config';
import {
  lastRpcReset,
  rpcRequestsInLastSecond,
  resetRpcStats,
  incrementRpcRequests,
} from '@/src/state';

export const checkRateLimit = async () => {
  const now = Date.now();
  if (now - lastRpcReset >= 1000) {
    resetRpcStats();
  }

  if (rpcRequestsInLastSecond >= rpcRateLimit) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // If the wait spans a second boundary, the next call to checkRateLimit
    // or the 1-second check in the if block above will handle the reset.
  }
  incrementRpcRequests();
};

export const isTransactionStuck = (lastCheckedAt: Date | null): boolean => {
  if (!lastCheckedAt) return false;
  return Date.now() - lastCheckedAt.getTime() > transactionTimeout;
};
