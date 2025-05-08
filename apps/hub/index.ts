import { ValidatorManager } from '@/utils/validatorSelection';
import { startWebSocketServer } from '@/src/websocket/server';
import { startMonitoring } from '@/src/monitoring/monitoringService';

console.log('Initializing Hub...');

const validatorManager = new ValidatorManager();

// Start the WebSocket server
startWebSocketServer(8081, validatorManager);

// Start the monitoring service
startMonitoring(validatorManager);

console.log('Hub initialized and services started.');
