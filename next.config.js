/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
