"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types/cart";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, qty: number) => void;
  onRemove: (cartItemId: string) => void;
  /** true = full stepper (checkout), false = compact (side panel) */
  showControls?: boolean;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  showControls = false,
}: CartItemCardProps) {
  const variantEntries = Object.entries(item.variants);
  const lineTotal = item.productPrice * item.quantity;

  return (
    <div className="flex gap-3 py-3">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-system-100 border border-system-200">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-system-200 text-[10px]">
            No img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-system-400 truncate leading-snug">
          {item.productName}
        </p>

        {variantEntries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {variantEntries.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 capitalize"
              >
                {value}
              </Badge>
            ))}
          </div>
        )}

        {showControls ? (
          /* Full stepper — checkout page */
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-0 border border-system-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium select-none">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-system-400">
                {formatPrice(lineTotal, "en-US")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(item.cartItemId)}
                aria-label="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Compact — side panel */
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">
                ×{item.quantity}
              </Badge>
              <span className="text-xs text-system-300">
                {formatPrice(item.productPrice, "en-US")} each
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-system-300 hover:text-destructive"
              onClick={() => onRemove(item.cartItemId)}
              aria-label="Remove item"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
