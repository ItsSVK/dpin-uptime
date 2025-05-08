export let isPollerHealthy = true;
export let lastSuccessfulPoll = Date.now();
export const processingTransactions = new Set<string>();
export let rpcRequestsInLastSecond = 0;
export let lastRpcReset = Date.now();

export function setPollerHealth(status: boolean) {
  isPollerHealthy = status;
}

export function updateLastSuccessfulPoll() {
  lastSuccessfulPoll = Date.now();
}

export function resetRpcStats() {
  rpcRequestsInLastSecond = 0;
  lastRpcReset = Date.now();
}

export function incrementRpcRequests() {
  rpcRequestsInLastSecond++;
}
