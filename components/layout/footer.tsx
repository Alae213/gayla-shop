"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-lg font-bold">{t("common.appName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t("nav.products")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.products")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t("nav.contact")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: contact@gayla.dz</li>
              <li>Tel: +213 XXX XXX XXX</li>
            </ul>
          </div>

          {/* Admin */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t("nav.admin")}</h3>
            <Link
              href={`/${locale}/admin/login`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("admin.login")}
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Gayla. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
