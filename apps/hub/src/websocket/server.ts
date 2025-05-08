import { serve, type ServerWebSocket, type Server } from 'bun';
import { ValidatorManager } from '@/utils/validatorSelection';
import {
  onWebSocketOpen,
  onWebSocketMessage,
  onWebSocketClose,
} from '@/src/websocket/handlers';
import type { MyWebSocketData } from '@/src/constants';
import { getClientIp } from '@/utils/ipUtils';

export function startWebSocketServer(
  port: number,
  validatorManagerInstance: ValidatorManager
) {
  serve<MyWebSocketData, undefined>({
    fetch(req: Request, server: Server) {
      const clientIp = getClientIp(req);
      // Upgrade request to WebSocket
      if (server.upgrade(req, { data: { clientIp } })) {
        return; // Bun handles the response for successful upgrades
      }
      return new Response('Upgrade failed', { status: 500 });
    },
    port: port,
    websocket: {
      open(ws: ServerWebSocket<MyWebSocketData>) {
        onWebSocketOpen(ws);
      },
      message(ws: ServerWebSocket<MyWebSocketData>, message: string | Buffer) {
        // Ensure message is string. If it's a Buffer, convert to string.
        const messageString = Buffer.isBuffer(message)
          ? message.toString()
          : message;
        onWebSocketMessage(ws, messageString, validatorManagerInstance);
      },
      close(ws: ServerWebSocket<MyWebSocketData>) {
        onWebSocketClose(ws, validatorManagerInstance);
      },
    },
  });
  console.log(`WebSocket server started on port ${port}`);
}
