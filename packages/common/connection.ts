import { clusterApiUrl, Connection, type Cluster } from '@solana/web3.js';

const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || 'devnet';

export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
