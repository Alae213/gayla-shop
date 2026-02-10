"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Package, ShoppingCart, Settings } from "lucide-react";
import Link from "next/link";

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
          <ConvexClientProvider>{children}</ConvexClientProvider>
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
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </ConvexClientProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-muted border-r">
              <div className="p-6">
                <h2 className="text-2xl font-bold">Gayla Admin</h2>
                <p className="text-sm text-muted-foreground">{adminUser.email}</p>
              </div>

              <nav className="space-y-2 px-4">
                <Link href="/admin/dashboard">
                  <Button
                    variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/admin/orders">
                  <Button
                    variant={pathname.startsWith("/admin/orders") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                </Link>

                <Link href="/admin/products">
                  <Button
                    variant={pathname.startsWith("/admin/products") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Products
                  </Button>
                </Link>

                <Link href="/admin/settings">
                  <Button
                    variant={pathname.startsWith("/admin/settings") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </nav>

              <div className="absolute bottom-0 w-64 p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">{children}</main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
