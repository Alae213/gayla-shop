"use client";

/**
 * ProductActions - Product page actions with cart integration
 * Manages OrderForm and AddToCart with cart panel
 */

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { OrderForm } from "@/components/products/order-form";
import { AddToCartButton } from "./add-to-cart-button";
import { CartSidePanel } from "@/components/cart/cart-side-panel";
import { VariantSelection } from "@/lib/types/cart";

interface ProductActionsProps {
  product: Doc<"products">;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<VariantSelection>({});

  // Determine if product has variants
  const hasVariants = Boolean(
    (product.variantGroups && product.variantGroups.length > 0) ||
    (product.variants && product.variants.length > 0)
  );

  // Get thumbnail from first image
  const thumbnail = product.images?.[0]?.url;

  return (
    <>
      <div className="space-y-6">
        {/* Variant Selection (if any) */}
        {hasVariants && product.variantGroups && (
          <div className="space-y-4">
            {product.variantGroups.map((group) => (
              <div key={group.name} className="space-y-2">
                <label className="text-sm font-medium text-system-400">
                  {group.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.values
                    .filter((v) => v.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((value) => {
                      const isSelected = selectedVariants[group.name] === value.label;
                      return (
                        <button
                          key={value.label}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [group.name]: value.label,
                            }))
                          }
                          className={`px-4 py-2 rounded-md border-2 transition-all ${
                            isSelected
                              ? "border-brand-200 bg-brand-50 text-brand-200 font-medium"
                              : "border-system-200 hover:border-system-300 text-system-400"
                          }`}
                        >
                          {value.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <AddToCartButton
          productId={product._id}
          slug={product.slug}
          name={product.title}
          price={product.price}
          status={product.status}
          thumbnail={thumbnail}
          variants={selectedVariants}
          hasVariants={hasVariants}
          onSuccess={() => setCartPanelOpen(true)}
          className="w-full"
        />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-system-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-system-300">Or</span>
          </div>
        </div>

        {/* Order Form (existing direct checkout) */}
        <OrderForm product={product} />
      </div>

      {/* Cart Side Panel */}
      <CartSidePanel open={cartPanelOpen} onOpenChange={setCartPanelOpen} />
    </>
  );
}
