"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

    try {
      setAdminUser(JSON.parse(user));
    } catch {
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  }, [router, pathname]);

  // Don't show gating UI on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-50 to-system-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-200 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-system-50">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
