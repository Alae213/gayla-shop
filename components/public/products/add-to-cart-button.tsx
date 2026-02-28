"use client";

/**
 * AddToCartButton - Add product to cart with variant validation
 * Opens cart side panel on success
 *
 * ARCHITECTURE NOTE:
 * This component no longer fetches product data. The parent must pass variantGroups
 * if the product has variants. This avoids duplicate queries — the parent already
 * has the product data from its own useQuery.
 */

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { VariantSelection } from "@/lib/types/cart";
import { toast } from "sonner";

interface VariantValue {
  label: string;
  enabled: boolean;
  order: number;
}

interface VariantGroup {
  name: string;
  values: VariantValue[];
}

interface AddToCartButtonProps {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  status: "Active" | "Draft" | "Out of stock";
  thumbnail?: string;
  variants: VariantSelection;
  hasVariants: boolean;
  variantGroups?: VariantGroup[];
  onSuccess?: () => void;
  className?: string;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  status,
  thumbnail,
  variants,
  hasVariants,
  variantGroups,
  onSuccess,
  className,
}: AddToCartButtonProps) {
  const { addItem, canAdd } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  if (status !== "Active") {
    return null;
  }

  const handleAddToCart = async () => {
    if (!canAdd) {
      toast.error("Cart is full (maximum 10 items)");
      return;
    }

    let finalVariants = variants;

    if (hasVariants && Object.keys(variants).length === 0 && variantGroups) {
      finalVariants = {};
      for (const group of variantGroups) {
        const firstEnabled = group.values
          .filter((v) => v.enabled)
          .sort((a, b) => a.order - b.order)[0];

        if (firstEnabled) {
          finalVariants[group.name] = firstEnabled.label;
        }
      }
    }

    setIsAdding(true);

    try {
      addItem(productId, slug, name, price, finalVariants, thumbnail, 1);

      toast.success("Added to cart", {
        description: hasVariants && Object.keys(finalVariants).length > 0
          ? `${name} (${Object.entries(finalVariants)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")})`
          : name,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      size="lg"
      className={className}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
