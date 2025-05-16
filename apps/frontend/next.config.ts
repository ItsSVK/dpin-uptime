import type { NextConfig } from 'next';
import { createCivicAuthPlugin } from '@civic/auth-web3/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Prevent Webpack from trying to bundle `pino-pretty`
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
    };

    return config;
  },
};

const withCivicAuth = createCivicAuthPlugin({
  // clientId: `771c8ce2-0f4a-4aa3-a14a-d91529afdddf`,
  clientId: `${process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID}`,
  // include: ['/dashboard/*'],
  // oauthServer is not necessary for production.
  oauthServer: process.env.AUTH_SERVER || 'https://auth.civic.com/oauth',
});

export default withCivicAuth(nextConfig);
