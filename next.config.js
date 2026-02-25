/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // Image Optimization
  // ============================================================================
  images: {
    // Remote image sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud", // Convex file storage
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash images
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // Cloudinary (if used)
      },
    ],
    
    // Modern image formats for better compression
    formats: ['image/webp', 'image/avif'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    
    // Image sizes for different use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimize layout shift
    minimumCacheTTL: 60,
    
    // Image optimization quality (1-100)
    // 85 is a good balance between quality and file size
    dangerouslyAllowSVG: false,
  },

  // ============================================================================
  // Performance Optimizations
  // ============================================================================
  
  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Compress output
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Power trace for bundle analysis
  experimental: {
    // Optimize package imports (tree shaking)
    optimizePackageImports: [
      'date-fns',
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },

  // ============================================================================
  // Webpack Configuration
  // ============================================================================
  webpack: (config, { dev, isServer }) => {
    // Only optimize in production
    if (!dev) {
      // Code splitting optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks
            default: false,
            vendors: false,
            
            // React & Next.js
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            
            // UI libraries
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner)[\\/]/,
              priority: 30,
              enforce: true,
            },
            
            // Drag & Drop
            dnd: {
              name: 'dnd',
              test: /[\\/]node_modules[\\/](@dnd-kit)[\\/]/,
              priority: 25,
              enforce: true,
            },
            
            // Date utilities
            date: {
              name: 'date',
              test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
              priority: 20,
              enforce: true,
            },
            
            // Convex
            convex: {
              name: 'convex',
              test: /[\\/]node_modules[\\/](convex)[\\/]/,
              priority: 20,
              enforce: true,
            },
            
            // Common chunks (shared between pages)
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };

      // Tree shaking for date-fns (only import used functions)
      config.resolve.alias = {
        ...config.resolve.alias,
        'date-fns': 'date-fns',
      };
    }

    return config;
  },

  // ============================================================================
  // Headers for Performance
  // ============================================================================
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // DNS Prefetch for external domains
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Preconnect to Convex
          {
            key: 'Link',
            value: '<https://api.convex.cloud>; rel=preconnect; crossorigin',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // Production Only Settings
  // ============================================================================
  productionBrowserSourceMaps: false, // Disable source maps in production
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
};

export default nextConfig;
