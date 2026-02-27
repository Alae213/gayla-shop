"use client";

/**
 * CartSidePanel - Slide-in cart panel from right
 * Displays cart items with Buy Now action
 */

import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartItemCard } from "./cart-item-card";
import { useCart } from "@/hooks/use-cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCartItemKey } from "@/lib/types/cart";

interface CartSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidePanel({ open, onOpenChange }: CartSidePanelProps) {
  const router = useRouter();
  const { items, itemCount, subtotal, isEmpty, isLoaded } = useCart();

  const handleBuyNow = () => {
    onOpenChange(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
            {!isEmpty && isLoaded && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {!isLoaded
              ? "Loading..."
              : isEmpty
              ? "Your shopping cart is empty"
              : "Review your items before checkout"}
          </SheetDescription>
        </SheetHeader>

        {!isLoaded ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Loading cart...</p>
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add products to your cart to continue shopping
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          /* Cart Items */
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-0">
                {items.map((item) => (
                  <CartItemCard
                    key={getCartItemKey(item)}
                    item={item}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator />

              {/* Subtotal */}
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-lg">
                  {subtotal.toLocaleString("fr-DZ")} DA
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Delivery cost will be calculated at checkout
              </p>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleBuyNow}
                  className="w-full"
                  size="lg"
                >
                  Buy Now
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
