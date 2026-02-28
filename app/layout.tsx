"use client";

import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
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
      </body>
    </html>
  );
}
