"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShoppingCart, Menu, X, HelpCircle, Info } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ShoppingBag className="h-6 w-6 text-brand-200" />
          <span className="font-extrabold text-lg tracking-tight text-system-400">Gayla</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`caption-text font-semibold transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-brand-200"
                  : "text-system-300 hover:text-system-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart icon */}
          <button
            aria-label="Cart"
            className="relative p-2 rounded-lg hover:bg-system-100 transition-colors text-system-400"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-system-100 transition-colors text-system-400"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-2 rounded-lg body-text font-semibold transition-colors ${
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-brand-200 bg-primary-50"
                    : "text-system-400 hover:bg-system-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
