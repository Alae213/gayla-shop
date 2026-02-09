const createNextIntlPlugin = require('next-intl/plugin');

// ✅ FIXED: Specify the config file path explicitly
const withNextIntl = createNextIntlPlugin('./next-intl.config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
