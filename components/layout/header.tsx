"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Menu, ShoppingBag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Header() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const changeLocale = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(`/${locale}`, "");
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-bold">{t("common.appName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href={`/${locale}`}
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            {t("nav.home")}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t("nav.products")}
          </Link>
        </nav>

        {/* Right Side - Language Selector */}
        <div className="flex items-center space-x-4">
          <Select value={locale} onValueChange={changeLocale}>
            <SelectTrigger className="w-[100px]">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
