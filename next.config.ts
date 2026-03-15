import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone-Output: erzeugt minimales self-contained Build für Docker
  output: 'standalone',
};

export default nextConfig;
