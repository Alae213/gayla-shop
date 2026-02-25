/**
 * Online Status Hook
 * 
 * Detects network connectivity and provides real-time status updates.
 * Features:
 * - Online/offline detection
 * - Connection quality monitoring
 * - Server reachability checks
 * - Debounced status changes
 * - SSR safe
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ConnectionQuality {
  /** Effective connection type */
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  /** Downlink speed in Mbps */
  downlink?: number;
  /** Round trip time in ms */
  rtt?: number;
  /** Data saver mode enabled */
  saveData?: boolean;
}

export interface OnlineStatus {
  /** Is browser online */
  isOnline: boolean;
  /** Was online (previous state) */
  wasOnline: boolean;
  /** Connection quality info */
  quality: ConnectionQuality;
  /** Last time went offline */
  lastOfflineAt: Date | null;
  /** Last time came online */
  lastOnlineAt: Date | null;
  /** Can reach server */
  canReachServer: boolean;
}

interface UseOnlineStatusOptions {
  /** Enable server reachability checks */
  checkServer?: boolean;
  /** Server check interval (ms) */
  checkInterval?: number;
  /** Server endpoint to ping */
  serverEndpoint?: string;
  /** Debounce status changes (ms) */
  debounceMs?: number;
}

/**
 * Get connection quality from Network Information API
 */
function getConnectionQuality(): ConnectionQuality {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return {
      effectiveType: 'unknown',
    };
  }

  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (!connection) {
    return {
      effectiveType: 'unknown',
    };
  }

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Check if server is reachable
 */
async function checkServerReachability(
  endpoint: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Custom hook for online status detection
 */
export function useOnlineStatus({
  checkServer = false,
  checkInterval = 30000, // 30 seconds
  serverEndpoint = '/api/health',
  debounceMs = 1000,
}: UseOnlineStatusOptions = {}): OnlineStatus {
  // Initialize with browser online status
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });

  const [wasOnline, setWasOnline] = useState(isOnline);
  const [quality, setQuality] = useState<ConnectionQuality>(
    getConnectionQuality()
  );
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [canReachServer, setCanReachServer] = useState(true);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const serverCheckTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update online status with debouncing
   */
  const updateOnlineStatus = useCallback((online: boolean) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce status change
    debounceTimer.current = setTimeout(() => {
      setWasOnline(isOnline);
      setIsOnline(online);
      
      if (online) {
        setLastOnlineAt(new Date());
      } else {
        setLastOfflineAt(new Date());
      }

      // Update connection quality
      setQuality(getConnectionQuality());
    }, debounceMs);
  }, [isOnline, debounceMs]);

  /**
   * Check server reachability periodically
   */
  const checkServer_ = useCallback(async () => {
    if (!checkServer || typeof window === 'undefined') return;

    const reachable = await checkServerReachability(serverEndpoint);
    setCanReachServer(reachable);

    // If server unreachable but browser says online, we're "online" but can't reach server
    if (!reachable && isOnline) {
      console.warn('Server unreachable, but browser reports online');
    }
  }, [checkServer, serverEndpoint, isOnline]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Online/offline events
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change event
    const handleConnectionChange = () => {
      setQuality(getConnectionQuality());
    };

    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Visibility change (check when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, check status
        updateOnlineStatus(navigator.onLine);
        if (checkServer) {
          checkServer_();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      if (serverCheckTimer.current) {
        clearInterval(serverCheckTimer.current);
      }
    };
  }, [updateOnlineStatus, checkServer, checkServer_]);

  /**
   * Set up periodic server checks
   */
  useEffect(() => {
    if (!checkServer || typeof window === 'undefined') return;

    // Initial check
    checkServer_();

    // Periodic checks
    serverCheckTimer.current = setInterval(checkServer_, checkInterval);

    return () => {
      if (serverCheckTimer.current) {
        clearInterval(serverCheckTimer.current);
      }
    };
  }, [checkServer, checkInterval, checkServer_]);

  return {
    isOnline,
    wasOnline,
    quality,
    lastOfflineAt,
    lastOnlineAt,
    canReachServer,
  };
}

/**
 * Hook to execute callback when connection status changes
 */
export function useOnlineStatusChange(
  onOnline?: () => void,
  onOffline?: () => void
) {
  const { isOnline, wasOnline } = useOnlineStatus();

  useEffect(() => {
    // Just went online
    if (isOnline && !wasOnline) {
      onOnline?.();
    }
    
    // Just went offline
    if (!isOnline && wasOnline) {
      onOffline?.();
    }
  }, [isOnline, wasOnline, onOnline, onOffline]);

  return { isOnline, wasOnline };
}

/**
 * Get connection quality label
 */
export function getConnectionQualityLabel(
  quality: ConnectionQuality
): string {
  switch (quality.effectiveType) {
    case 'slow-2g':
      return 'Very Slow';
    case '2g':
      return 'Slow';
    case '3g':
      return 'Moderate';
    case '4g':
      return 'Fast';
    default:
      return 'Unknown';
  }
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(quality: ConnectionQuality): boolean {
  return quality.effectiveType === 'slow-2g' || quality.effectiveType === '2g';
}
