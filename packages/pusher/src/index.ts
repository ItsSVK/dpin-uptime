import {
  PUSHER_APP_CLUSTER,
  PUSHER_APP_ID,
  PUSHER_APP_KEY,
  PUSHER_APP_SECRET,
} from './config';
import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
  appId: PUSHER_APP_ID,
  key: PUSHER_APP_KEY,
  secret: PUSHER_APP_SECRET,
  cluster: PUSHER_APP_CLUSTER,
  useTLS: true,
});

export const pusherClient = new PusherClient(PUSHER_APP_KEY, {
  cluster: PUSHER_APP_CLUSTER,
});
