"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

function MissingEnvNotice() {
  const isProd = process.env.NODE_ENV === "production";
  const message =
    "Missing NEXT_PUBLIC_CONVEX_URL. Copy .env.example to .env.local and set NEXT_PUBLIC_CONVEX_URL (and run `npx convex dev`).";

  if (isProd) {
    // In prod, fail loudly so we don't silently run without data.
    throw new Error(message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Configuration error</p>
        <p className="mt-2 text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!url) return null;
    return new ConvexReactClient(url);
  }, [url]);

  if (!client) {
    return <MissingEnvNotice />;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
