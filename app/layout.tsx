import "./globals.css";
import type { Metadata } from "next";
<<<<<<< HEAD
=======
import { ConvexClientProvider } from "@/providers/convex-provider";
import { Toaster } from "sonner";
>>>>>>> 3340b4bacbe93056ab266c499aa1e0e27aa1486f

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
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body>
        <ConvexClientProvider>
          {children}
          {/* Global toast mount so both public + admin work */}
          <Toaster position="top-right" richColors closeButton duration={3000} />
        </ConvexClientProvider>
      </body>
>>>>>>> 3340b4bacbe93056ab266c499aa1e0e27aa1486f
    </html>
  );
}
