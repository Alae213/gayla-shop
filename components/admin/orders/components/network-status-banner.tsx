"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

interface NetworkStatusBannerProps {
  className?: string;
}

export function NetworkStatusBanner({ className = "" }: NetworkStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      console.log("[NetworkStatus] Reconnected");
      setIsOnline(true);
      setWasOffline(true);
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

  if (isOnline && wasOffline) {
    return (
      <div
        className={`flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
          <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span>Back online. Your changes will now sync automatically.</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className={`flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center shrink-0 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span>
          You're offline. Changes will sync when you reconnect.
        </span>
      </div>
    );
  }

  return null;
}