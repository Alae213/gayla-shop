"use client";

import * as React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { QuantityStepper } from "./quantity-stepper";
import { VariantSelectorDropdown } from "./variant-selector-dropdown";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { generateShimmerDataURL } from "@/lib/utils/image-placeholder";

export interface LineItem {
  productId: Id<"products">;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  variants?: Record<string, string>;
  lineTotal: number;
  thumbnail?: string;
}

interface LineItemRowProps {
  item: LineItem;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (variant: Record<string, string>) => void;
  onRemove: () => void;
  disabled?: boolean;
  isProductDeleted?: boolean;
}

export function LineItemRow({
  item,
  onQuantityChange,
  onVariantChange,
  onRemove,
  disabled = false,
  isProductDeleted = false,
}: LineItemRowProps) {
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(newQuantity);
  };

  // Calculate line total when quantity changes
  const calculatedLineTotal = item.quantity * item.unitPrice;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 p-4 border border-[#ECECEC] rounded-xl bg-white transition-colors",
          isProductDeleted && "bg-gray-50 border-gray-300",
          disabled && "opacity-60"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-[#F5F5F5] border border-[#ECECEC]">
          {item.thumbnail && !imageError ? (
            <Image
              src={item.thumbnail}
              alt={item.productName || "Product"}
              fill
              className="object-cover"
              sizes="64px"
              placeholder="blur"
              blurDataURL={generateShimmerDataURL(64, 64)}
              loading="lazy"
              quality={85}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#AAAAAA]">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info & Variant Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h4
              className={cn(
                "text-[14px] font-medium text-[#3A3A3A] leading-snug",
                isProductDeleted && "text-gray-500 line-through"
              )}
            >
              {item.productName}
            </h4>
            {isProductDeleted && (
              <div className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                <AlertTriangle className="w-3 h-3" />
                <span>Deleted</span>
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {!isProductDeleted && (
            <VariantSelectorDropdown
              productId={item.productId}
              currentVariant={item.variants ?? {}}
              onChange={onVariantChange}
              disabled={disabled}
            />
          )}
          {isProductDeleted && item.variants && (
            <div className="text-[12px] text-gray-500 italic">
              {Object.entries(item.variants)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          )}
        </div>

        {/* Quantity Stepper */}
        <QuantityStepper
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={disabled}
          min={1}
          max={99}
        />

        {/* Line Total */}
        <div className="flex flex-col items-end gap-1 w-28 shrink-0">
          <span className="text-[15px] font-bold text-[#3A3A3A]">
            {calculatedLineTotal.toLocaleString()} DZD
          </span>
          <span className="text-[11px] text-[#AAAAAA]">
            {item.unitPrice.toLocaleString()} × {item.quantity}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowRemoveDialog(true)}
          disabled={disabled}
          className="shrink-0 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Remove ${item.productName}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{item.productName}</strong> from this order?
              <br />
              This will update the order total immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove();
                setShowRemoveDialog(false);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
