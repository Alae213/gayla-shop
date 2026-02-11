"use client";

import { Inter } from "next/font/google";
import "../globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/admin/login") {
      return;
    }

    const user = localStorage.getItem("adminUser");
    if (!user) {
      router.push("/admin/login");
      return;
    }
    setAdminUser(JSON.parse(user));
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  // Don't show navigation on login page
  if (pathname === "/admin/login") {
    return (
      <html lang="en">
        <body className={inter.className}>
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

  // Show loading state while checking auth
  if (!adminUser) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <ConvexClientProvider>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
              </div>
            </div>
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

  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="min-h-screen flex bg-gray-50">
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>

          {/* Toast Notifications */}
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
