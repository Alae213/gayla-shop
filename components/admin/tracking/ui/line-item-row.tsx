"use client";

import * as React from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
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
import { useLoadingState } from "@/hooks/use-mutation-state";

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
  const { isLoading: isRemoving, wrap } = useLoadingState();

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(newQuantity);
  };

  const handleRemove = async () => {
    await wrap(async () => {
      onRemove();
      setShowRemoveDialog(false);
    });
  };

  // Calculate line total when quantity changes
  const calculatedLineTotal = item.quantity * item.unitPrice;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 p-5 border border-[#ECECEC] rounded-xl bg-white transition-colors",
          isProductDeleted && "bg-gray-50 border-gray-300",
          (disabled || isRemoving) && "opacity-60"
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
                "text-[16px] font-semibold text-[#3A3A3A] leading-[1.4]",
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
              disabled={disabled || isRemoving}
            />
          )}
          {isProductDeleted && item.variants && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(item.variants).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quantity Stepper */}
        <QuantityStepper
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={disabled || isRemoving}
          min={1}
          max={99}
        />

        {/* Line Total */}
        <div className="flex flex-col items-end gap-1 w-32 shrink-0">
          <span className="text-[17px] font-bold text-[#3A3A3A]">
            {calculatedLineTotal.toLocaleString()} DZD
          </span>
          <span className="text-[12px] text-[#888888] font-medium">
            {item.unitPrice.toLocaleString()} × {item.quantity}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowRemoveDialog(true)}
          disabled={disabled || isRemoving}
          className="shrink-0 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Remove ${item.productName}`}
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
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
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
