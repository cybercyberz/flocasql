/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    // Add polyfills for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  output: 'standalone',
  basePath: '',
  trailingSlash: true
};

module.exports = nextConfig;