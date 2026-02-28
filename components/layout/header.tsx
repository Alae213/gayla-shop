"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartCount } from "@/hooks/use-cart-count";
import { CartSidePanel } from "@/components/cart/cart-side-panel";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count: cartLineCount, isLoaded } = useCartCount();

  return (
    <>
      <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="page-container flex h-16 items-center justify-between gap-4">
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
                className={cn(
                  "caption-text font-semibold transition-colors",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-brand-200"
                    : "text-system-300 hover:text-system-400"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <ThemeToggle className="text-system-400" />

            {/* Cart button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="relative text-system-400"
            >
              <ShoppingCart className="h-5 w-5" />
              {isLoaded && cartLineCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-200 text-white text-xs font-bold flex items-center justify-center">
                  {cartLineCount > 9 ? "9+" : cartLineCount}
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden text-system-400"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="page-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "py-3 px-2 rounded-lg body-text font-semibold transition-colors",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "text-brand-200 bg-primary-50"
                      : "text-system-400 hover:bg-system-100"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Side Panel */}
      <CartSidePanel open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
