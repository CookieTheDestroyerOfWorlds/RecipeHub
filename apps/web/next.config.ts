import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@recipehub/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless', 'bcryptjs'],
  },
};

export default nextConfig;
