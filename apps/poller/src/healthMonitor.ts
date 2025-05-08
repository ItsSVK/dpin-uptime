import { healthCheckInterval, pollingInterval } from '@/src/config';
import {
  lastSuccessfulPoll,
  setPollerHealth,
  processingTransactions,
} from '@/src/state';

let healthInterval: NodeJS.Timeout | null = null;

export const startHealthMonitoring = () => {
  if (healthInterval) {
    console.log('Health monitoring is already running.');
    return;
  }
  console.log('Starting health monitor...');
  healthInterval = setInterval(async () => {
    const now = Date.now();
    if (now - lastSuccessfulPoll > pollingInterval * 3) {
      setPollerHealth(false);
      console.error(
        '⚠️ Poller health check failed - no successful polls recently'
      );
      // Alert mechanism could be added here
      // await sendAlert('Poller health check failed');
      processingTransactions.clear(); // Try to recover by clearing processing set
    } else {
      // Optionally, if a cycle completes successfully elsewhere and sets pollerHealthy = true,
      // this could also set it to true if the above condition isn't met.
      // However, current logic implies successful polls in pollPendingTransactions set it to true.
    }
  }, healthCheckInterval);
};

export const stopHealthMonitoring = () => {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
    console.log('Health monitor stopped.');
  }
};
