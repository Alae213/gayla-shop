import "./globals.css";
import type { Metadata } from "next";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gayla Shop",
  description: "Gayla e-commerce",
};

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
          {/* Global toast mount so both public + admin work */}
          <Toaster position="top-right" richColors closeButton duration={3000} />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
