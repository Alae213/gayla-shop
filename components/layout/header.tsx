"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const linkBase = "text-sm font-medium transition caption-text";

  return (
    <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <ShoppingBag className="h-7 w-7" />
          <span className="font-bold text-xl">Gayla Shop</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/products"
            className={`${linkBase} ${
              pathname === "/products"
                ? "text-brand-200 font-semibold"
                : "text-system-300 hover:text-system-400"
            }`}
          >
            Products
          </Link>
          <Link
            href="/track-order"
            className={`${linkBase} ${
              pathname === "/track-order"
                ? "text-brand-200 font-semibold"
                : "text-system-300 hover:text-system-400"
            }`}
          >
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
