/**
 * IMAGE PLACEHOLDER UTILITIES
 * 
 * Generates blur placeholders for Next.js Image component
 * to improve perceived performance and reduce LCP.
 */

/**
 * Generate a base64-encoded SVG blur placeholder
 * 
 * @param width - Placeholder width in pixels
 * @param height - Placeholder height in pixels
 * @param color - Background color (default: light gray)
 * @returns Base64 data URL for placeholder
 */
export function generateBlurDataURL(
  width: number = 100,
  height: number = 100,
  color: string = '#f5f5f5'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `.trim();
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a shimmer effect placeholder (animated)
 * 
 * @param width - Placeholder width in pixels
 * @param height - Placeholder height in pixels
 * @returns Base64 data URL with shimmer animation
 */
export function generateShimmerDataURL(
  width: number = 100,
  height: number = 100
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e5e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <animate attributeName="x1" from="-100%" to="100%" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="x2" from="0%" to="200%" dur="1.5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)" />
    </svg>
  `.trim();
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Fallback placeholder image path
 * Should be placed in /public directory
 */
export const FALLBACK_PRODUCT_IMAGE = '/placeholder-product.png';

/**
 * Check if URL is a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
    return validExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string | null | undefined,
  alt: string,
  size: { width: number; height: number }
) {
  const isValid = isValidImageUrl(src);
  
  return {
    src: isValid && src ? src : FALLBACK_PRODUCT_IMAGE,
    alt: alt || 'Product image',
    width: size.width,
    height: size.height,
    placeholder: 'blur' as const,
    blurDataURL: generateShimmerDataURL(size.width, size.height),
    loading: 'lazy' as const,
    quality: 85,
  };
}
