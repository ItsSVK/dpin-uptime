import type { NextConfig } from 'next';

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

export default nextConfig;
