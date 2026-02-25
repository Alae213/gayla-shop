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
    <div className="min-h-screen bg-gradient-to-b from-system-100 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Large 404 */}
        <div 
          className="text-9xl font-bold text-primary-200 mb-8 animate-fade-in"
          aria-hidden="true"
        >
          404
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-100 rounded-full">
            <FileQuestion 
              className="w-16 h-16 text-primary-300" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-system-400 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-system-300 mb-8 max-w-md mx-auto">
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
              bg-primary-300 text-white
              hover:bg-primary-400 transition-colors
              font-medium
              focus-visible:outline focus-visible:outline-2 
              focus-visible:outline-offset-2 focus-visible:outline-primary-300
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
              bg-white border-2 border-system-200 text-system-400
              hover:bg-system-100 transition-colors
              font-medium
              focus-visible:outline focus-visible:outline-2 
              focus-visible:outline-offset-2 focus-visible:outline-primary-300
            "
          >
            <Package className="w-5 h-5" aria-hidden="true" />
            Browse Products
          </Link>
        </div>

        {/* Search Suggestions */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-5 h-5 text-system-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-system-400">
              Try searching for something else
            </h2>
          </div>

          <p className="text-system-300 mb-6">
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
                    text-system-400 hover:bg-primary-100 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-primary-300
                  "
                >
                  <span className="font-medium">Home Page</span>
                  <span className="text-sm text-system-300 block">
                    Start from the beginning
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="
                    block px-4 py-3 rounded-lg
                    text-system-400 hover:bg-primary-100 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-primary-300
                  "
                >
                  <span className="font-medium">All Products</span>
                  <span className="text-sm text-system-300 block">
                    Browse our full catalog
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/tracking"
                  className="
                    block px-4 py-3 rounded-lg
                    text-system-400 hover:bg-primary-100 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-primary-300
                  "
                >
                  <span className="font-medium">Order Tracking</span>
                  <span className="text-sm text-system-300 block">
                    Check your order status
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/admin"
                  className="
                    block px-4 py-3 rounded-lg
                    text-system-400 hover:bg-primary-100 
                    transition-colors text-left
                    focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-primary-300
                  "
                >
                  <span className="font-medium">Admin Dashboard</span>
                  <span className="text-sm text-system-300 block">
                    Manage orders and inventory
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Help Text */}
        <p className="text-sm text-system-300 mt-8">
          If you believe this is an error, please{' '}
          <a 
            href="mailto:support@gaylashop.com"
            className="text-primary-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 rounded"
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
