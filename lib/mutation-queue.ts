/**
 * Mutation Queue
 * 
 * Queues mutations when offline and retries them when connection is restored.
 * Uses localStorage for persistence across page reloads.
 */

import { retryFetch } from './utils/retry-fetch';

export interface QueuedMutation {
  /** Unique identifier */
  id: string;
  /** Mutation name/type */
  type: string;
  /** Request URL */
  url: string;
  /** Request options */
  options: RequestInit;
  /** Timestamp when queued */
  queuedAt: number;
  /** Number of retry attempts */
  attempts: number;
  /** Priority (higher = more important) */
  priority: number;
  /** Metadata for tracking */
  metadata?: Record<string, any>;
}

export interface QueueState {
  /** Pending mutations */
  pending: QueuedMutation[];
  /** Currently processing */
  processing: boolean;
  /** Failed mutations */
  failed: QueuedMutation[];
  /** Completed count */
  completedCount: number;
}

type MutationListener = (state: QueueState) => void;

const STORAGE_KEY = 'gayla_mutation_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Mutation Queue Manager
 */
class MutationQueue {
  private queue: QueuedMutation[] = [];
  private processing = false;
  private failed: QueuedMutation[] = [];
  private completedCount = 0;
  private listeners: Set<MutationListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.queue = data.pending || [];
        this.failed = data.failed || [];
        this.completedCount = data.completedCount || 0;
      }
    } catch (error) {
      console.error('Failed to load mutation queue:', error);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pending: this.queue,
          failed: this.failed,
          completedCount: this.completedCount,
        })
      );
    } catch (error) {
      console.error('Failed to save mutation queue:', error);
    }
  }

  /**
   * Notify listeners of state change
   */
  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add mutation to queue
   */
  enqueue(
    type: string,
    url: string,
    options: RequestInit = {},
    priority: number = 0,
    metadata?: Record<string, any>
  ): string {
    // Check queue size
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Mutation queue is full');
    }

    // Check for duplicates (same type + similar timestamp)
    const isDuplicate = this.queue.some(
      m => m.type === type && Math.abs(m.queuedAt - Date.now()) < 1000
    );

    if (isDuplicate) {
      console.warn(`Duplicate mutation detected: ${type}`);
      return '';
    }

    const mutation: QueuedMutation = {
      id: this.generateId(),
      type,
      url,
      options,
      queuedAt: Date.now(),
      attempts: 0,
      priority,
      metadata,
    };

    this.queue.push(mutation);
    
    // Sort by priority (descending)
    this.queue.sort((a, b) => b.priority - a.priority);

    this.saveToStorage();
    this.notifyListeners();

    console.log(`Queued mutation: ${type} (${mutation.id})`);

    return mutation.id;
  }

  /**
   * Process all pending mutations
   */
  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.notifyListeners();

    console.log(`Processing ${this.queue.length} queued mutations...`);

    while (this.queue.length > 0) {
      const mutation = this.queue[0];

      try {
        await this.processMutation(mutation);
        
        // Success - remove from queue
        this.queue.shift();
        this.completedCount++;
        
        console.log(`Completed mutation: ${mutation.type} (${mutation.id})`);
      } catch (error) {
        mutation.attempts++;

        if (mutation.attempts >= MAX_RETRY_ATTEMPTS) {
          // Max attempts reached - move to failed
          console.error(
            `Mutation failed after ${MAX_RETRY_ATTEMPTS} attempts:`,
            mutation.type,
            error
          );
          
          this.failed.push(this.queue.shift()!);
        } else {
          // Keep in queue for retry
          console.warn(
            `Mutation failed (attempt ${mutation.attempts}/${MAX_RETRY_ATTEMPTS}):`,
            mutation.type,
            error
          );
          
          // Move to end of queue
          this.queue.push(this.queue.shift()!);
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.saveToStorage();
      this.notifyListeners();
    }

    this.processing = false;
    this.notifyListeners();

    console.log('Queue processing complete');
  }

  /**
   * Process a single mutation
   */
  private async processMutation(mutation: QueuedMutation): Promise<void> {
    const response = await retryFetch(
      mutation.url,
      mutation.options,
      {
        maxRetries: 2,
        initialDelay: 500,
        onRetry: (error, attempt) => {
          console.log(
            `Retrying mutation ${mutation.type} (attempt ${attempt})`,
            error.message
          );
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Clear completed mutations
   */
  clearCompleted(): void {
    this.completedCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Retry failed mutations
   */
  retryFailed(): void {
    // Move failed back to queue
    this.failed.forEach(mutation => {
      mutation.attempts = 0; // Reset attempts
      this.queue.push(mutation);
    });

    this.failed = [];
    
    // Sort by priority
    this.queue.sort((a, b) => b.priority - a.priority);

    this.saveToStorage();
    this.notifyListeners();

    // Start processing
    this.processQueue();
  }

  /**
   * Clear failed mutations
   */
  clearFailed(): void {
    this.failed = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clear entire queue
   */
  clearAll(): void {
    this.queue = [];
    this.failed = [];
    this.completedCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): QueueState {
    return {
      pending: [...this.queue],
      processing: this.processing,
      failed: [...this.failed],
      completedCount: this.completedCount,
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: MutationListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Singleton instance
let queueInstance: MutationQueue | null = null;

/**
 * Get mutation queue instance
 */
export function getMutationQueue(): MutationQueue {
  if (!queueInstance) {
    queueInstance = new MutationQueue();
  }
  return queueInstance;
}

/**
 * Hook to use mutation queue in React components
 */
import { useState, useEffect } from 'react';

export function useMutationQueue() {
  const [state, setState] = useState<QueueState>({
    pending: [],
    processing: false,
    failed: [],
    completedCount: 0,
  });

  useEffect(() => {
    const queue = getMutationQueue();
    
    // Initial state
    setState(queue.getState());

    // Subscribe to updates
    const unsubscribe = queue.subscribe(setState);

    return unsubscribe;
  }, []);

  return {
    ...state,
    enqueue: (type: string, url: string, options?: RequestInit, priority?: number, metadata?: Record<string, any>) => {
      return getMutationQueue().enqueue(type, url, options, priority, metadata);
    },
    processQueue: () => getMutationQueue().processQueue(),
    retryFailed: () => getMutationQueue().retryFailed(),
    clearFailed: () => getMutationQueue().clearFailed(),
    clearAll: () => getMutationQueue().clearAll(),
  };
}

/**
 * Example usage:
 * 
 * const { pending, processing, enqueue, processQueue } = useMutationQueue();
 * 
 * // Queue a mutation when offline
 * const saveMutation = () => {
 *   enqueue(
 *     'update_order',
 *     '/api/orders/123',
 *     {
 *       method: 'PATCH',
 *       body: JSON.stringify({ status: 'completed' }),
 *     },
 *     10 // High priority
 *   );
 * };
 * 
 * // Process when back online
 * useEffect(() => {
 *   if (isOnline && pending.length > 0) {
 *     processQueue();
 *   }
 * }, [isOnline]);
 */
