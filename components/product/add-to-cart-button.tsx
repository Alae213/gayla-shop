"use client";

/**
 * AddToCartButton - Add product to cart with variant validation
 * Opens cart side panel on success
 */

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { VariantSelection } from "@/lib/types/cart";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AddToCartButtonProps {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  status: "Active" | "Draft" | "Out of stock";
  thumbnail?: string;
  variants: VariantSelection;
  hasVariants: boolean;
  onSuccess?: () => void; // Callback to open cart panel
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
  onSuccess,
  className,
}: AddToCartButtonProps) {
  const { addItem, canAdd } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  // Fetch product to get variant groups for auto-selection
  const product = useQuery(api.products.getById, { id: productId });

  // Hide button for non-active products
  if (status !== "Active") {
    return null;
  }

  const handleAddToCart = async () => {
    // Check cart limit first
    if (!canAdd) {
      toast.error("Cart is full (maximum 10 items)");
      return;
    }

    // Auto-select default variants if user hasn't selected any
    let finalVariants = variants;
    
    if (hasVariants && Object.keys(variants).length === 0 && product?.variantGroups) {
      // Auto-pick first enabled value from each variant group
      finalVariants = {};
      for (const group of product.variantGroups) {
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

      // Open cart side panel
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
      disabled={isAdding || !product}
      size="lg"
      className={className}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
