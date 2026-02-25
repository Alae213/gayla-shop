/**
 * Global Error Boundary
 * 
 * Catches errors that occur in the root layout.
 * Must render full HTML page (no layout wrapper).
 */

'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('Global error caught:', error);

    // TODO: Send to error tracking service (Sentry)
    // logCriticalError(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Critical Error - Gayla Shop</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(to bottom, #fef2f2, #ffffff);
            color: #1f2937;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          
          .container {
            max-width: 600px;
            width: 100%;
            text-align: center;
          }
          
          .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: #fecaca;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .icon svg {
            width: 40px;
            height: 40px;
            color: #dc2626;
          }
          
          h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1f2937;
          }
          
          p {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          
          .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          button, a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }
          
          .primary {
            background: #ec4899;
            color: white;
            border: none;
          }
          
          .primary:hover {
            background: #db2777;
          }
          
          .secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
          }
          
          .secondary:hover {
            background: #f9fafb;
          }
          
          .error-details {
            margin-top: 2rem;
            padding: 1rem;
            background: #fef2f2;
            border-radius: 0.5rem;
            text-align: left;
            font-family: monospace;
            font-size: 0.875rem;
            color: #dc2626;
            word-break: break-all;
          }
          
          .help {
            margin-top: 2rem;
            padding: 1.5rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .help h2 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
          
          .help ul {
            text-align: left;
            list-style: none;
          }
          
          .help li {
            padding: 0.5rem 0;
            color: #6b7280;
          }
          
          .help li::before {
            content: '•';
            color: #ec4899;
            font-weight: bold;
            display: inline-block;
            width: 1em;
            margin-left: -1em;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Icon */}
          <div className="icon">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1>Critical Error</h1>

          {/* Description */}
          <p>
            We encountered a critical error that prevented the application from loading. 
            Please try refreshing the page or contact support if the problem persists.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="error-details">
              <strong>Error:</strong> {error.message}
              {error.digest && (
                <>
                  <br />
                  <strong>Digest:</strong> {error.digest}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="buttons">
            <button onClick={reset} className="primary">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Page
            </button>

            <a href="/" className="secondary">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </a>
          </div>

          {/* Help Section */}
          <div className="help">
            <h2>What can you do?</h2>
            <ul>
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try a different browser</li>
              <li>Contact support at support@gaylashop.com</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  );
}
