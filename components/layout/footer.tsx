"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Footer() {
  const siteContent = useQuery(api.siteContent.get);

  const contactEmail = siteContent?.contactEmail || "contact@gaylashop.com";
  const contactPhone = siteContent?.contactPhone || "";

  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Gayla Shop</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted online store in Algeria
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-muted-foreground hover:text-primary">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Email: {contactEmail}
              {contactPhone && (
                <>
                  <br />
                  Phone: {contactPhone}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; 2026 Gayla Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
