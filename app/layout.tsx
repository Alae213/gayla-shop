"use client";

import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ConvexClientProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
