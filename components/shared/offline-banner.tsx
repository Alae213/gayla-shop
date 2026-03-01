/**
 * Offline Banner Component
 * 
 * Displays network status notifications to users.
 * Shows when offline, reconnecting, or connection is slow.
 */

'use client';

import { useOnlineStatus, getConnectionQualityLabel, isSlowConnection } from '@/hooks/use-online-status';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OfflineBannerProps {
  /** Show connection quality warnings */
  showQualityWarnings?: boolean;
  /** Auto-hide delay when back online (ms) */
  autoHideDelay?: number;
}

export function OfflineBanner({
  showQualityWarnings = true,
  autoHideDelay = 3000,
}: OfflineBannerProps) {
  const { isOnline, wasOnline, quality, canReachServer } = useOnlineStatus({
    checkServer: true,
    checkInterval: 30000, // Check every 30 seconds
  });

  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'error' | 'warning' | 'info'>('error');

  /**
   * Determine banner state and message
   */
  useEffect(() => {
    // Offline
    if (!isOnline) {
      setMessage('You are offline. Some features may be unavailable.');
      setSeverity('error');
      setIsVisible(true);
      return;
    }

    // Online but can't reach server
    if (isOnline && !canReachServer) {
      setMessage('Connection issues detected. Retrying...');
      setSeverity('warning');
      setIsVisible(true);
      return;
    }

    // Slow connection warning
    if (isOnline && showQualityWarnings && isSlowConnection(quality)) {
      const qualityLabel = getConnectionQualityLabel(quality);
      setMessage(`Connection is ${qualityLabel.toLowerCase()}. Some features may load slowly.`);
      setSeverity('warning');
      setIsVisible(true);
      return;
    }

    // Back online
    if (isOnline && wasOnline === false) {
      setMessage('Back online!');
      setSeverity('info');
      setIsVisible(true);

      // Auto-hide after delay
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }

    // All good
    setIsVisible(false);
  }, [isOnline, wasOnline, canReachServer, quality, showQualityWarnings, autoHideDelay]);

  if (!isVisible) return null;

  // Severity styles
  const severityStyles = {
    error: {
      bg: 'bg-error-100',
      text: 'text-error-300',
      border: 'border-error-200',
      icon: WifiOff,
    },
    warning: {
      bg: 'bg-warning-100',
      text: 'text-warning-300',
      border: 'border-warning-200',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-success-100',
      text: 'text-success-300',
      border: 'border-success-200',
      icon: Wifi,
    },
  };

  const style = severityStyles[severity];
  const Icon = style.icon;

  return (
    <div
      role="status"
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="fixed top-0 left-0 right-0 z-50 animate-slide-down"
    >
      <div
        className={`
          ${style.bg} ${style.text} ${style.border}
          border-b-2 px-4 py-3 shadow-lg
          flex items-center justify-center gap-3
          transition-all duration-300
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        
        <p className="text-sm font-medium">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss notification"
          className={`
            ml-auto p-1 rounded hover:bg-black/5 
            focus-visible:outline focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-current
            transition-colors
          `}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Connection Status Indicator (for navbar/footer)
 */
export function ConnectionStatusIndicator() {
  const { isOnline, quality } = useOnlineStatus();

  if (isOnline && !isSlowConnection(quality)) {
    return null; // Don't show when all is well
  }

  const isSlow = isSlowConnection(quality);

  return (
    <div
      className="flex items-center gap-2 text-sm"
      role="status"
      aria-live="polite"
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 text-error-300" aria-hidden="true" />
          <span className="text-system-300">Offline</span>
        </>
      ) : isSlow ? (
        <>
          <AlertTriangle className="w-4 h-4 text-warning-300" aria-hidden="true" />
          <span className="text-system-300">Slow Connection</span>
        </>
      ) : null}
    </div>
  );
}

/**
 * Add animation to globals.css:
 * 
 * @keyframes slide-down {
 *   from {
 *     transform: translateY(-100%);
 *     opacity: 0;
 *   }
 *   to {
 *     transform: translateY(0);
 *     opacity: 1;
 *   }
 * }
 * 
 * .animate-slide-down {
 *   animation: slide-down 0.3s ease-out;
 * }
 */
