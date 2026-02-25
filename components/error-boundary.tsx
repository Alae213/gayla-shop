"use client";

import * as React from "react";
import { Component, ReactNode } from "react";
import { captureError } from "@/sentry.client.config";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to show when error occurs */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Context name for better error tracking */
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child component tree and:
 * 1. Logs error to Sentry with context
 * 2. Shows fallback UI to user
 * 3. Allows user to retry/recover
 * 
 * @example
 * ```tsx
 * <ErrorBoundary context="Order Details">
 *   <TrackingOrderDetails order={order} />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, context } = this.props;

    // Log to Sentry with context
    captureError(error, {
      componentStack: errorInfo.componentStack,
      context: context || "ErrorBoundary",
      errorBoundary: true,
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, context } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {context ? `Error in ${context}` : "Something went wrong"}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We've been notified and are working on a fix. Try refreshing the page or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-xs text-left bg-gray-100 p-4 rounded-lg mb-4 max-w-2xl overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          )}
          <Button
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 * Note: This doesn't catch errors in the component itself, only in children
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

/**
 * Lightweight error boundary for admin sections
 */
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      context="Admin Dashboard"
      fallback={(error, retry) => (
        <div className="flex flex-col items-center justify-center min-h-[600px] p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin Section Error</h2>
          <p className="text-gray-600 mb-2 max-w-md text-center">
            The admin interface encountered an error.
          </p>
          <p className="text-sm text-gray-500 mb-8 max-w-md text-center">
            This has been logged. Please try refreshing or contact the development team.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button onClick={retry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
