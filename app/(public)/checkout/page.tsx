"use client";

/**
 * Checkout Page - Multi-item cart checkout with delivery integration
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { CheckoutCartItems } from "@/components/checkout/checkout-cart-items";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isEmpty, isLoaded } = useCart();

  // Redirect to homepage if cart is empty (after loading)
  useEffect(() => {
    if (isLoaded && isEmpty) {
      router.push("/");
    }
  }, [isLoaded, isEmpty, router]);

  // Show loading state while cart loads
  if (!isLoaded) {
    return (
      <div className="page-container py-16 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show empty state (before redirect)
  if (isEmpty) {
    return (
      <div className="page-container py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground">
              Add some products to your cart to continue
            </p>
          </div>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Review your items and complete your order
        </p>
      </div>

      {/* Two-column layout: Cart Items (left) + Order Form (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Cart Items */}
        <div className="order-2 lg:order-1">
          <CheckoutCartItems />
        </div>

        {/* Right: Checkout Form */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-4">
            <CheckoutForm />
          </div>
        </div>
      </div>
    </div>
  );
}
