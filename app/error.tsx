/**
 * Custom Error Boundary Page
 * 
 * Catches errors in the application and shows a friendly error page.
 * Allows users to retry or go back home.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by error boundary:', error);
    }

    // TODO: Send to error tracking service (Sentry)
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-error-100 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-error-100 rounded-full">
            <AlertTriangle 
              className="w-16 h-16 text-error-300" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-system-400 mb-4">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="text-lg text-system-300 mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-error-100 rounded-lg text-left max-w-lg mx-auto">
            <p className="text-sm font-mono text-error-400 break-all">
              <strong>Error:</strong> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-error-300 mt-2">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={reset}
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
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            Try Again
          </button>

          <Link
            href="/"
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
            <Home className="w-5 h-5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-system-400 mb-4">
            What can you do?
          </h2>

          <ul className="space-y-3 text-left max-w-md mx-auto">
            <li className="flex gap-3">
              <span className="text-primary-300 flex-shrink-0">•</span>
              <span className="text-system-300">
                Click <strong className="text-system-400">"Try Again"</strong> to reload the page
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-300 flex-shrink-0">•</span>
              <span className="text-system-300">
                Check your internet connection
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-300 flex-shrink-0">•</span>
              <span className="text-system-300">
                Clear your browser cache and cookies
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-300 flex-shrink-0">•</span>
              <span className="text-system-300">
                If the problem persists,{' '}
                <a 
                  href="mailto:support@gaylashop.com"
                  className="text-primary-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 rounded"
                >
                  contact support
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Technical Support */}
        <p className="text-xs text-system-300 mt-8">
          Error ID: {error.digest || 'Unknown'}
        </p>
      </div>
    </div>
  );
}
