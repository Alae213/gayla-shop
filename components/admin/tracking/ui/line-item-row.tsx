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
          "flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 border border-[#ECECEC] rounded-xl bg-white transition-colors hover:shadow-sm",
          isProductDeleted && "bg-gray-50 border-gray-300",
          (disabled || isRemoving) && "opacity-60"
        )}
      >
        {/* Row 1 Mobile / Left Desktop: Image + Product Name */}
        <div className="flex items-start gap-3 md:gap-6">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 bg-[#F5F5F5] border border-[#ECECEC] shadow-sm">
            {item.thumbnail && !imageError ? (
              <Image
                src={item.thumbnail}
                alt={item.productName || "Product"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 64px, 80px"
                placeholder="blur"
                blurDataURL={generateShimmerDataURL(64, 64)}
                loading="lazy"
                quality={85}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#AAAAAA]">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8"
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

          {/* Product Name */}
          <div className="flex-1 min-w-0 md:flex-initial md:pr-4">
            <div className="flex items-start gap-2">
              <h4
                className={cn(
                  "text-[15px] md:text-[17px] font-semibold text-[#2C2C2C] leading-[1.3]",
                  isProductDeleted && "text-gray-500 line-through"
                )}
              >
                {item.productName}
              </h4>
              {isProductDeleted && (
                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-[11px] text-amber-600 bg-amber-50 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full shrink-0 font-medium">
                  <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>Deleted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2 Mobile / Middle Desktop: Variant Selector */}
        {!isProductDeleted && (
          <div className="w-full md:flex-1 md:min-w-0">
            <VariantSelectorDropdown
              productId={item.productId}
              currentVariant={item.variants ?? {}}
              onChange={onVariantChange}
              disabled={disabled || isRemoving}
              className="w-full md:w-auto"
            />
          </div>
        )}
        {isProductDeleted && item.variants && (
          <div className="w-full md:flex-1 md:min-w-0">
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {Object.entries(item.variants).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 text-[11px] md:text-[12px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Row 3 Mobile / Right Desktop: Quantity + Price + Remove */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6">
          {/* Quantity Stepper */}
          <div className="flex flex-col items-center md:items-center">
            <span className="text-[10px] md:text-[11px] font-medium text-[#666666] uppercase tracking-wider mb-1.5 md:mb-2">Qty</span>
            <QuantityStepper
              value={item.quantity}
              onChange={handleQuantityChange}
              disabled={disabled || isRemoving}
              min={1}
              max={99}
            />
          </div>

          {/* Line Total */}
          <div className="flex flex-col items-end gap-1 md:gap-1.5 min-w-[100px] md:min-w-[120px]">
            <span className="text-[16px] md:text-[18px] font-bold text-[#2C2C2C] whitespace-nowrap">
              {calculatedLineTotal.toLocaleString()} DZD
            </span>
            <span className="text-[11px] md:text-[12px] text-[#888888] font-medium text-right whitespace-nowrap">
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
            className="shrink-0 hover:bg-rose-50 hover:text-rose-600 h-9 w-9 md:h-10 md:w-10 rounded-lg transition-all"
            aria-label={`Remove ${item.productName}`}
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
            )}
          </Button>
        </div>
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
