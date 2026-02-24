"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { CartItemCard } from "./cart-item-card";

export function CartSidePanel() {
  const {
    items,
    subtotal,
    itemCount,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();
  const router = useRouter();

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCartOpen, closeCart]);

  function handleBuyNow() {
    closeCart();
    router.push("/checkout");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-system-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-system-400" />
            <h2 className="text-base font-bold text-system-400">
              Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-system-300">
                  ({itemCount}/10)
                </span>
              )}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
              <ShoppingCart className="h-14 w-14 text-system-200 opacity-30" />
              <p className="text-system-300 text-sm">Your cart is empty</p>
              <Button variant="outline" size="sm" onClick={closeCart}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-system-100">
              {items.map((item) => (
                <CartItemCard
                  key={item.cartItemId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  showControls={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-system-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-system-300">Subtotal</span>
              <span className="text-base font-bold text-system-400">
                {formatPrice(subtotal, "en-US")}
              </span>
            </div>
            <p className="text-xs text-system-300">
              Delivery cost calculated at checkout
            </p>
            <Button className="w-full" size="lg" onClick={handleBuyNow}>
              Proceed to Checkout →
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
