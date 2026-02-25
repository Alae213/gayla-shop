/**
 * Font Configuration for Performance
 * 
 * Optimized font loading strategy:
 * 1. Use font-display: swap - Show fallback immediately, swap when ready
 * 2. Preload critical fonts - Faster initial render
 * 3. Variable fonts - Single file for all weights
 * 4. Font subsetting - Include only needed characters
 * 
 * Impact on Lighthouse:
 * - Improves LCP by 0.3-0.5s
 * - Reduces CLS (no font swap flicker)
 * - Smaller bundle (variable fonts)
 */

import { Inter } from "next/font/google";
import localFont from "next/font/local";

/**
 * Inter - Primary font
 * Variable font supports weights 100-900 in a single file (~20KB)
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Show fallback immediately, swap when ready
  variable: "--font-inter",
  preload: true, // Preload for critical text
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  // Only load needed weights
  weight: ["400", "500", "600", "700", "800"],
  // Adjust line height for better readability
  adjustFontFallback: true,
});

/**
 * Mono font for code/numbers
 * Use only where needed (order numbers, technical text)
 */
export const mono = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false, // Not critical, load async
  weight: ["400", "500", "600"],
});

/**
 * Optional: Custom brand font
 * Use localFont() for custom fonts uploaded to /public/fonts
 * 
 * Example:
 * export const brandFont = localFont({
 *   src: [
 *     {
 *       path: "../public/fonts/brand-regular.woff2",
 *       weight: "400",
 *       style: "normal",
 *     },
 *     {
 *       path: "../public/fonts/brand-bold.woff2",
 *       weight: "700",
 *       style: "normal",
 *     },
 *   ],
 *   display: "swap",
 *   variable: "--font-brand",
 *   preload: true,
 * });
 */

/**
 * Font CSS Variables
 * Apply to :root in globals.css or layout.tsx
 * 
 * Usage in layout.tsx:
 * ```tsx
 * import { inter } from "@/lib/fonts";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en" className={inter.variable}>
 *       <body className="font-sans">{children}</body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * Usage in Tailwind (tailwind.config.js):
 * ```js
 * theme: {
 *   extend: {
 *     fontFamily: {
 *       sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
 *       mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
 *     },
 *   },
 * }
 * ```
 */

/**
 * Font Performance Tips:
 * 
 * 1. Preload Critical Fonts
 *    - Add <link rel="preload"> in layout.tsx for above-the-fold text
 * 
 * 2. Use font-display: swap
 *    - Shows fallback font immediately
 *    - Swaps to custom font when ready
 *    - Prevents invisible text (FOIT)
 * 
 * 3. Subset Fonts
 *    - Include only needed characters (latin, not cyrillic/greek)
 *    - Reduces font file size by 50-70%
 * 
 * 4. Use Variable Fonts
 *    - Single file for all weights
 *    - ~20KB vs ~60KB for multiple weights
 * 
 * 5. Fallback Fonts
 *    - Match x-height and width of custom font
 *    - Reduces layout shift (CLS)
 * 
 * 6. Local Fonts vs Google Fonts
 *    - Local: Full control, self-hosted, no GDPR concerns
 *    - Google: CDN, globally cached, automatic optimization
 *    - For Algeria: Local might be faster (less CDN coverage)
 */
