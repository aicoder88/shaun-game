/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: require('path').join(__dirname),
  images: {
    formats: ['image/webp'],
  },
  // Ensure proper static file handling
  trailingSlash: false,
  // Skip audio file processing to avoid webpack issues
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig