"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: {
    _id: string;
    slug: string;
    titleAR: string;
    titleFR: string;
    titleEN: string;
    price: number;
    images: Array<{
      storageId: string;
      url: string;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("products");
  const params = useParams();
  const locale = params.locale as string;

  // Get title based on locale
  const title =
    locale === "ar"
      ? product.titleAR
      : locale === "en"
      ? product.titleEN
      : product.titleFR;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/${locale}/products/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-lg font-bold mt-2">
          {formatPrice(product.price, locale === "ar" ? "ar-DZ" : "fr-DZ")}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/${locale}/products/${product.slug}`} className="w-full">
          <Button className="w-full">{t("orderNow")}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
