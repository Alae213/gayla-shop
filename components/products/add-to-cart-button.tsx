"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import type { AddToCartPayload, CartVariant } from "@/lib/types/cart";
import type { Id } from "@/convex/_generated/dataModel";

interface AddToCartButtonProps {
  productId: Id<"products">;
  productName: string;
  productSlug: string;
  productPrice: number;
  thumbnail: string | null;
  variants: CartVariant;
  isActive: boolean;
  className?: string;
}

type BtnState = "idle" | "adding" | "added" | "error";

export function AddToCartButton({
  productId,
  productName,
  productSlug,
  productPrice,
  thumbnail,
  variants,
  isActive,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [btnState, setBtnState] = useState<BtnState>("idle");

  // Hidden entirely for non-active products
  if (!isActive) return null;

  async function handleClick() {
    setBtnState("adding");

    const payload: AddToCartPayload = {
      productId: productId as unknown as string,
      productName,
      productSlug,
      productPrice,
      thumbnail,
      variants,
    };

    // Brief artificial delay so the loading state is visible
    await new Promise((r) => setTimeout(r, 250));

    const result = addItem(payload);

    if (result.success) {
      setBtnState("added");
      openCart();
      toast.success(`${productName} added to cart`);
      setTimeout(() => setBtnState("idle"), 2000);
    } else {
      setBtnState("error");
      toast.error(result.error ?? "Could not add to cart");
      setTimeout(() => setBtnState("idle"), 3000);
    }
  }

  const config: Record<BtnState, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    idle: {
      label: "Add to Cart",
      icon: <ShoppingCart className="h-4 w-4" />,
      variant: "outline",
    },
    adding: {
      label: "Adding...",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      variant: "outline",
    },
    added: {
      label: "Added!",
      icon: <Check className="h-4 w-4" />,
      variant: "default",
    },
    error: {
      label: "Cart Full",
      icon: <AlertCircle className="h-4 w-4" />,
      variant: "destructive",
    },
  };

  const current = config[btnState];

  return (
    <Button
      variant={current.variant}
      size="lg"
      className={`gap-2 ${className}`}
      onClick={handleClick}
      disabled={btnState !== "idle"}
    >
      {current.icon}
      {current.label}
    </Button>
  );
}
