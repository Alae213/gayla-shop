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

  // Modularize imports for better tree-shaking
  modularizeImports: {
    // Auto tree-shake Lucide icons
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    // Auto tree-shake Recharts
    'recharts': {
      transform: 'recharts/es6/{{member}}',
    },
  },

  // Power trace for bundle analysis
  experimental: {
    // Optimize package imports (tree shaking)
    optimizePackageImports: [
      'date-fns',
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      'recharts',
    ],
    
    // Better code splitting
    optimizeCss: true,
    
    // Webpack build worker for faster builds
    webpackBuildWorker: true,
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
            
            // React & Next.js (Framework - highest priority)
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              priority: 50,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // UI libraries (Radix, Lucide, Sonner)
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner|cmdk)[\\/]/,
              priority: 40,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Charts (Recharts) - separate chunk
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              priority: 35,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Drag & Drop
            dnd: {
              name: 'dnd',
              test: /[\\/]node_modules[\\/](@dnd-kit)[\\/]/,
              priority: 30,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Rich Text Editor (TipTap)
            editor: {
              name: 'editor',
              test: /[\\/]node_modules[\\/](@tiptap|prosemirror-.*)[\\/]/,
              priority: 30,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Date utilities
            date: {
              name: 'date',
              test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
              priority: 25,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Convex
            convex: {
              name: 'convex',
              test: /[\\/]node_modules[\\/](convex)[\\/]/,
              priority: 25,
              enforce: true,
              reuseExistingChunk: true,
            },
            
            // Common chunks (shared between pages)
            common: {
              name: 'common',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            
            // Shared utilities
            lib: {
              name: 'lib',
              test: /[\\/]lib[\\/]/,
              minChunks: 2,
              priority: 15,
              reuseExistingChunk: true,
            },
          },
        },
        
        // Minimize module IDs for smaller bundle
        moduleIds: 'deterministic',
        
        // Better runtime chunk
        runtimeChunk: {
          name: 'runtime',
        },
      };

      // Tree shaking for date-fns (only import used functions)
      config.resolve.alias = {
        ...config.resolve.alias,
        'date-fns': 'date-fns',
      };
      
      // Analyze bundle size (run with ANALYZE=true)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
          enabled: true,
        });
      }
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
        // Cache static assets aggressively
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache JavaScript and CSS
        source: '/_next/static/:path*',
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
      {
        // Cache fonts
        source: '/fonts/:path*',
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
  
  // Compiler options
  compiler: {
    // Remove console logs in production (except errors/warnings)
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
};

export default nextConfig;
