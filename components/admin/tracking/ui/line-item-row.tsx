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
          "group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-lg",
          isProductDeleted && "bg-gray-50 border-gray-300 opacity-75",
          (disabled || isRemoving) && "opacity-60 pointer-events-none"
        )}
      >
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Product Image - Col 1-3 */}
          <div className="lg:col-span-3">
            <div className="relative aspect-square w-full max-w-[120px] mx-auto lg:mx-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              {item.thumbnail && !imageError ? (
                <Image
                  src={item.thumbnail}
                  alt={item.productName || "Product"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 120px, 120px"
                  placeholder="blur"
                  blurDataURL={generateShimmerDataURL(120, 120)}
                  loading="lazy"
                  quality={90}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Details - Col 4-8 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className={cn(
                  "text-lg font-semibold text-gray-900 leading-tight flex-1",
                  isProductDeleted && "text-gray-500 line-through"
                )}>
                  {item.productName}
                </h3>
                {isProductDeleted && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Deleted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {!isProductDeleted && (
              <div className="space-y-2">
                <VariantSelectorDropdown
                  productId={item.productId}
                  currentVariant={item.variants ?? {}}
                  onChange={onVariantChange}
                  disabled={disabled || isRemoving}
                  className="w-full max-w-sm"
                />
              </div>
            )}
            {isProductDeleted && item.variants && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.variants).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions Column - Col 9-12 */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-4">
              
              {/* Quantity & Price Container */}
              <div className="flex-1 lg:flex-initial flex flex-row sm:flex-col lg:flex-row items-center justify-between lg:justify-start gap-4">
                
                {/* Quantity Stepper */}
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</label>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={handleQuantityChange}
                    disabled={disabled || isRemoving}
                    min={1}
                    max={99}
                  />
                </div>

                {/* Price Display */}
                <div className="flex flex-col items-center sm:items-start lg:items-center space-y-1 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {calculatedLineTotal.toLocaleString()} DZD
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {item.unitPrice.toLocaleString()} × {item.quantity}
                  </div>
                </div>

              </div>

              {/* Remove Button */}
              <div className="flex items-center justify-center sm:justify-start lg:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={disabled || isRemoving}
                  className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group-hover:scale-105"
                  aria-label={`Remove ${item.productName}`}
                >
                  {isRemoving ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-4.5 h-4.5" />
                  )}
                </Button>
              </div>
              
            </div>
          </div>
          
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
