"use client";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { OrderForm } from "@/components/public/products/order-form";
import { Doc } from "@/convex/_generated/dataModel";

type Product = Doc<"products">;

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-8 lg:sticky lg:top-24">
      <div className="space-y-3">
        {product.category && (
          <Badge variant="secondary" className="caption-text">
            {product.category}
          </Badge>
        )}
        <h1 className="headline-h1 text-system-400 leading-tight">
          {product.title}
        </h1>
        <p className="text-3xl font-extrabold text-brand-200 tracking-tight">
          {formatPrice(product.price, "en-US")}
        </p>
      </div>

      <div className="border-t border-system-200" />

      {/* Description */}
      {product.description && (
        <div className="pt-2">
          <div
            className="prose prose-sm max-w-none text-system-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      <div className="border-t border-system-200" />

      <OrderForm product={product} />
    </div>
  );
}
