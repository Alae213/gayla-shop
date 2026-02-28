"use client";

/**
 * CheckoutCartItems - Editable cart items on checkout page
 * Allows quantity adjustment and item removal
 */

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/lib/types/cart";
import { cn } from "@/lib/utils";

export function CheckoutCartItems() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      updateQuantity(item.productId, item.variants, newQuantity);
    }
  };

  const handleRemove = (item: CartItem) => {
    if (confirm(`Remove ${item.name} from cart?`)) {
      removeItem(item.productId, item.variants);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Cart</span>
          <span className="text-sm font-normal text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items List */}
        <div className="space-y-4">
          {items.map((item) => {
            const hasVariants = Object.keys(item.variants).length > 0;
            const lineTotal = item.price * item.quantity;

            return (
              <div
                key={`${item.productId}-${JSON.stringify(item.variants)}`}
                className="flex gap-4 pb-4 border-b last:border-b-0"
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
                >
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString("fr-DZ")} DA each
                    </p>
                  </div>

                  {/* Variants */}
                  {hasVariants && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.variants).map(([key, value]) => (
                        <Badge
                          key={`${key}-${value}`}
                          variant="outline"
                          className="text-xs"
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
                            `${key}: ${value}`
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(item)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-semibold">
                    {lineTotal.toLocaleString("fr-DZ")} DA
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-base">
          <span className="font-medium">Subtotal ({itemCount} items)</span>
          <span className="font-bold text-lg">
            {subtotal.toLocaleString("fr-DZ")} DA
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Delivery cost will be calculated based on your address
        </p>
      </CardContent>
    </Card>
  );
}
