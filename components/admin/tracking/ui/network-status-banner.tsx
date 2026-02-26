"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

interface NetworkStatusBannerProps {
  className?: string;
}

/**
 * Network Status Banner
 * 
 * Displays a warning banner when the user goes offline.
 * Auto-hides when reconnected. Helps users understand
 * why their changes might not be syncing.
 */
export function NetworkStatusBanner({ className = "" }: NetworkStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      console.log("[NetworkStatus] Reconnected");
      setIsOnline(true);
      setWasOffline(true);
      // Hide "reconnected" message after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      console.log("[NetworkStatus] Disconnected");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show "reconnected" message briefly
  if (isOnline && wasOffline) {
    return (
      <div
        className={`flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span>Back online. Your changes will now sync automatically.</span>
      </div>
    );
  }

  // Show "offline" warning
  if (!isOnline) {
    return (
      <div
        className={`flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span>
          You're offline. Changes will sync when you reconnect.
        </span>
      </div>
    );
  }

  // Online and stable - show nothing
  return null;
}
