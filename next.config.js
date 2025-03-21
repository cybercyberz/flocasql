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
  // Use standalone output but disable static page generation
  output: 'standalone',
  basePath: '',
  trailingSlash: true,
  // Disable static page generation for API routes
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Disable static page generation completely
  staticPageGenerationTimeout: 1
};

module.exports = nextConfig;
