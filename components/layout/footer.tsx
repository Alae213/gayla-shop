"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  const siteContent = useQuery(api.siteContent.get);

  const contactEmail = siteContent?.contactEmail || "contact@gaylashop.com";
  const contactPhone = siteContent?.contactPhone || "";

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-200" />
              <span className="font-extrabold text-system-400">Gayla Shop</span>
            </Link>
            <p className="caption-text text-system-300 max-w-xs">
              Premium streetwear delivered anywhere in Algeria.
            </p>
          </div>

          <div className="space-y-3">
            <p className="caption-text font-semibold text-system-400 uppercase tracking-wide">Navigation</p>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="caption-text text-system-300 hover:text-brand-200 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/faq" className="caption-text text-system-300 hover:text-brand-200 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="caption-text text-system-300 hover:text-brand-200 transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="caption-text font-semibold text-system-400 uppercase tracking-wide">Contact</p>
            <div className="space-y-1">
              <p className="caption-text text-system-300">{contactEmail}</p>
              {contactPhone && (
                <p className="caption-text text-system-300">{contactPhone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-system-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="caption-text text-system-300">
            &copy; 2026 Gayla Shop. All rights reserved.
          </p>
          <p className="caption-text text-system-300">
            Made in Algeria 🇩🇿
          </p>
        </div>
      </div>
    </footer>
  );
}
