"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="font-bold text-xl">Gayla Shop</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition"
          >
            Products
          </Link>
          <Link
            href="/track-order"
            className="text-sm font-medium hover:text-primary transition"
          >
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
