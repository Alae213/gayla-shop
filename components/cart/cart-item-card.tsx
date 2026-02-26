"use client";

/**
 * CartItemCard - Individual cart item display
 * Shows product thumbnail, name, price, quantity, and variants
 */

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/lib/types/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
  className?: string;
}

export function CartItemCard({ item, className }: CartItemCardProps) {
  const { removeItem } = useCart();
  const hasVariants = Object.keys(item.variants).length > 0;

  const handleRemove = () => {
    removeItem(item.productId, item.variants);
  };

  return (
    <div
      className={cn(
        "flex gap-3 py-3 border-b last:border-b-0 relative group",
        className
      )}
    >
      {/* Thumbnail */}
      <Link
        href={`/products/${item.slug}`}
        className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted"
      >
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="font-medium text-sm hover:underline line-clamp-2 mb-1 pr-8"
        >
          {item.name}
        </Link>

        {/* Variants */}
        {hasVariants && (
          <div className="flex flex-wrap gap-1 mb-1">
            {Object.entries(item.variants).map(([key, value]) => (
              <Badge
                key={`${key}-${value}`}
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {key === "color" ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full border"
                      style={{ backgroundColor: value.toLowerCase() }}
                    />
                    {value}
                  </span>
                ) : (
                  `${value}`
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Price & Quantity */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Qty: {item.quantity}
          </span>
          <span className="font-semibold">
            {(item.price * item.quantity).toLocaleString("fr-DZ")} DA
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        onClick={handleRemove}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove from cart"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
