"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Phase 1 - T1.8: ThemeProvider wrapper
// Wraps next-themes provider for consistent theme management

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
