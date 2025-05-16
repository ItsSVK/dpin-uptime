import { Connection } from '@solana/web3.js';

// const SOLANA_NETWORK =
//   (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || 'devnet';

// export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

export const connection = new Connection(
  `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
);
