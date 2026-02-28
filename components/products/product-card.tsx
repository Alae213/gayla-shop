"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { ImageIcon } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: Id<"products">;
    title: string;
    slug: string;
    price: number;
    category?: string;
    images: Array<{
      url: string;
      storageId: string;
    }>;
    status: "Active" | "Draft" | "Out of stock";
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-m transition-shadow duration-300 cursor-pointer h-full">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <span className="caption-text">No Image</span>
            </div>
          )}
          {product.status === "Out of stock" && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {product.category && (
            <Badge variant="secondary" className="mb-2 caption-text">
              {product.category}
            </Badge>
          )}
          <h3 className="headline-h2 line-clamp-2 mb-2">
            {product.title}
          </h3>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <p className="body-text font-bold text-brand-200">
            {formatPrice(product.price, "en-US")}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
