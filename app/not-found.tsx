/**
 * Custom 404 Not Found Page
 * 
 * Shown when a page doesn't exist.
 * Provides helpful navigation and search suggestions.
 */

import Link from 'next/link';
import { Search, Home, Package, FileQuestion } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Gayla Shop',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Large 404 */}
        <div 
          className="text-9xl font-bold text-brand-100 mb-8 animate-fade-in"
          aria-hidden="true"
        >
          404
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-brand-50 rounded-full">
            <FileQuestion 
              className="w-16 h-16 text-brand-200" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It may have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="
              inline-flex items-center justify-center gap-2 
              px-6 py-3 rounded-lg
              bg-brand-200 text-white
              hover:bg-brand-300 transition-colors
              font-medium
              focus-visible:outline focus-visible:outline-2 
              focus-visible:outline-offset-2 focus-visible:outline-brand-200
            "
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            Back to Home
          </Link>

          <Link
            href="/products"
            className="
              inline-flex items-center justify-center gap-2 
              px-6 py-3 rounded-lg
              bg-card border-2 border-border text-foreground
              hover:bg-muted transition-colors
              font-medium
              focus-visible:outline focus-visible:outline-2 
              focus-visible:outline-offset-2 focus-visible:outline-brand-200
            "
          >
            <Package className="w-5 h-5" aria-hidden="true" />
            Browse Products
          </Link>
        </div>

        {/* Search Suggestions */}
        <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">
              Try searching for something else
            </h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Here are some popular pages that might help:
          </p>

          {/* Popular Links */}
          <nav aria-label="Popular pages">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="
                    block px-4 py-3 rounded-lg
                    text-foreground hover:bg-brand-50 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-brand-200
                  "
                >
                  <span className="font-medium">Home Page</span>
                  <span className="text-sm text-muted-foreground block">
                    Start from the beginning
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="
                    block px-4 py-3 rounded-lg
                    text-foreground hover:bg-brand-50 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-brand-200
                  "
                >
                  <span className="font-medium">All Products</span>
                  <span className="text-sm text-muted-foreground block">
                    Browse our full catalog
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/tracking"
                  className="
                    block px-4 py-3 rounded-lg
                    text-foreground hover:bg-brand-50 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-brand-200
                  "
                >
                  <span className="font-medium">Order Tracking</span>
                  <span className="text-sm text-muted-foreground block">
                    Check your order status
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/admin"
                  className="
                    block px-4 py-3 rounded-lg
                    text-foreground hover:bg-brand-50 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-brand-200
                  "
                >
                  <span className="font-medium">Admin Dashboard</span>
                  <span className="text-sm text-muted-foreground block">
                    Manage orders and inventory
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is an error, please{' '}
          <a 
            href="mailto:support@gaylashop.com"
            className="text-brand-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200 rounded"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/**
 * Add to globals.css:
 * 
 * @keyframes fade-in {
 *   from {
 *     opacity: 0;
 *     transform: translateY(-20px);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: translateY(0);
 *   }
 * }
 * 
 * .animate-fade-in {
 *   animation: fade-in 0.5s ease-out;
 * }
 */
