/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for production hosting
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ],
    unoptimized: true
  },
  webpack: (config) => {
    // Add polyfills for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false
    };
    return config;
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // Change from 'standalone' to 'export' to disable static page generation
  output: 'export',
  basePath: '',
  trailingSlash: true
};

module.exports = nextConfig;
