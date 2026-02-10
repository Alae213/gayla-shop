"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ProductCardProps {
  product: {
    _id: Id<"products">;
    title: string;
    slug: string;
    price: number;
    category: string;
    images: Array<{
      url: string;
      storageId: string;
    }>;
    status: "Active" | "Draft" | "Out of stock";
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-square relative bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
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
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {product.title}
          </h3>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <p className="text-xl font-bold text-primary">
            {formatPrice(product.price, "en-US")}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
