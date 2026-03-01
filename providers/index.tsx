"use client";

import { ThemeProvider } from "./theme-provider";
import { ConvexClientProvider } from "./convex-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="gayla-shop-theme"
    >
      <ConvexClientProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </ConvexClientProvider>
    </ThemeProvider>
  );
}
