/**
 * Retry Fetch Utility
 * 
 * Implements exponential backoff for failed requests.
 * Automatically retries on network errors with increasing delays.
 */

export interface RetryOptions {
  /** Maximum number of retries */
  maxRetries?: number;
  /** Initial delay in ms */
  initialDelay?: number;
  /** Maximum delay in ms */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Request timeout in ms */
  timeout?: number;
  /** Should retry this error */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Called on each retry */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

export interface RetryState {
  /** Current attempt number (1-based) */
  attempt: number;
  /** Total attempts made */
  totalAttempts: number;
  /** Is currently retrying */
  isRetrying: boolean;
  /** Last error */
  lastError: Error | null;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2,    // Double each time
  timeout: 30000,          // 30 seconds
  shouldRetry: (error: Error, attempt: number) => {
    // Retry on network errors, not on HTTP errors
    if (error.name === 'AbortError') return false;
    if (error.message.includes('Failed to fetch')) return true;
    if (error.message.includes('NetworkError')) return true;
    return attempt < 3; // Retry first 3 attempts
  },
  onRetry: () => {},
};

/**
 * Calculate delay for next retry using exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch with automatic retry and exponential backoff
 */
export async function retryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      // First attempt or retry
      const response = await fetchWithTimeout(input, init, opts.timeout);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      const shouldRetry = opts.shouldRetry(lastError, attempt);
      const isLastAttempt = attempt === opts.maxRetries + 1;

      if (!shouldRetry || isLastAttempt) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      // Notify retry
      opts.onRetry(lastError, attempt, delay);

      // Wait before retry
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Create a retry fetch function with custom options
 */
export function createRetryFetch(defaultOptions: RetryOptions) {
  return (input: RequestInfo | URL, init?: RequestInit, options?: RetryOptions) => {
    return retryFetch(input, init, { ...defaultOptions, ...options });
  };
}

/**
 * Hook for tracking retry state
 */
import { useState, useCallback } from 'react';

export function useRetryFetch() {
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    totalAttempts: 0,
    isRetrying: false,
    lastError: null,
  });

  const fetch = useCallback(
    async (
      input: RequestInfo | URL,
      init?: RequestInit,
      options?: RetryOptions
    ): Promise<Response> => {
      setRetryState({
        attempt: 1,
        totalAttempts: 1,
        isRetrying: false,
        lastError: null,
      });

      try {
        const response = await retryFetch(input, init, {
          ...options,
          onRetry: (error, attempt, delay) => {
            setRetryState({
              attempt,
              totalAttempts: attempt,
              isRetrying: true,
              lastError: error,
            });
            options?.onRetry?.(error, attempt, delay);
          },
        });

        setRetryState(prev => ({
          ...prev,
          isRetrying: false,
        }));

        return response;
      } catch (error) {
        setRetryState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  return { fetch, retryState };
}

/**
 * Helper to check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return true;
  }
  
  if (error.message.includes('NetworkError')) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    return false; // Don't retry aborted requests
  }

  // Server errors (5xx)
  if (error.message.match(/HTTP 5\d{2}/)) {
    return true;
  }

  // Rate limiting
  if (error.message.includes('429')) {
    return true;
  }

  return false;
}

/**
 * Create a fetch function with retry for Convex mutations
 */
export function createConvexRetryFetch() {
  return createRetryFetch({
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    shouldRetry: (error, attempt) => {
      // Retry network errors
      if (isRetryableError(error)) return true;
      
      // Retry first 2 attempts for any error
      return attempt <= 2;
    },
    onRetry: (error, attempt, delay) => {
      console.warn(
        `Retrying request (attempt ${attempt}/${3}) after ${delay}ms:`,
        error.message
      );
    },
  });
}

/**
 * Example usage:
 * 
 * // Basic usage
 * const response = await retryFetch('/api/data');
 * 
 * // With options
 * const response = await retryFetch('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * }, {
 *   maxRetries: 5,
 *   initialDelay: 2000,
 * });
 * 
 * // In a component
 * const { fetch, retryState } = useRetryFetch();
 * 
 * async function loadData() {
 *   try {
 *     const response = await fetch('/api/data');
 *     const data = await response.json();
 *   } catch (error) {
 *     console.error('Failed after retries:', error);
 *   }
 * }
 * 
 * // Show retry count
 * {retryState.isRetrying && (
 *   <p>Retrying... (attempt {retryState.attempt})</p>
 * )}
 */
