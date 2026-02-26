"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useRef } from "react";
import { Plus, Loader2, Check, RotateCcw } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LineItem, LineItemRow } from "./line-item-row";
import { AddProductModal } from "./add-product-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { recalculateDeliveryCost, AbortError } from "@/lib/utils/delivery-recalculator";
import { useAbortableEffect } from "@/hooks/use-abortable-effect";

interface OrderLineItemsEditorProps {
  orderId: Id<"orders">;
  initialLineItems: LineItem[];
  initialDeliveryCost: number;
  wilaya: string;
  deliveryType: "Stopdesk" | "Domicile";
  adminName?: string;
  onSaveSuccess?: (newTotal: number) => void;
}

/**
 * Calculate a stable hash for line items that only includes fields that
 * affect delivery cost (productId, quantity). Variant changes don't affect
 * shipping, so we exclude them from the hash to avoid unnecessary recalcs.
 */
function getDeliveryRelevantHash(items: LineItem[]): string {
  return items
    .map((item) => `${item.productId}:${item.quantity}`)
    .join("|");
}

export function OrderLineItemsEditor({
  orderId,
  initialLineItems,
  initialDeliveryCost,
  wilaya,
  deliveryType,
  adminName = "Admin",
  onSaveSuccess,
}: OrderLineItemsEditorProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [deliveryCost, setDeliveryCost] = useState(initialDeliveryCost);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<Error | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [lastSavedState, setLastSavedState] = useState({ 
    lineItems: initialLineItems, 
    deliveryCost: initialDeliveryCost 
  });

  // Keep refs for initial values and previous delivery-relevant hash
  const initialLineItemsRef = useRef(initialLineItems);
  const previousDeliveryHashRef = useRef(getDeliveryRelevantHash(initialLineItems));

  const updateLineItemsMutation = useMutation(api.orders.updateLineItems);

  // Detect if changes have been made
  const hasChanges = useMemo(() => {
    if (lineItems.length !== lastSavedState.lineItems.length) return true;
    return (
      JSON.stringify(lineItems) !== JSON.stringify(lastSavedState.lineItems) ||
      deliveryCost !== lastSavedState.deliveryCost
    );
  }, [lineItems, deliveryCost, lastSavedState]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [lineItems]
  );
  const total = subtotal + deliveryCost;

  // Auto-recalculate delivery cost when line items change in a way that affects shipping.
  // OPTIMIZATION: Only recalculate when quantity or items change, not when variants change.
  useAbortableEffect(
    (signal) => {
      // Skip recalc on initial mount
      const isInitial =
        JSON.stringify(lineItems) === JSON.stringify(initialLineItemsRef.current);
      if (isInitial || lineItems.length === 0) return;

      // Check if delivery-relevant fields changed (productId, quantity)
      const currentHash = getDeliveryRelevantHash(lineItems);
      const previousHash = previousDeliveryHashRef.current;
      
      // If only variants changed (hash unchanged), skip expensive delivery recalc
      if (currentHash === previousHash) {
        console.log("[DeliveryRecalc] Skipped: variant-only change detected");
        return;
      }

      console.log("[DeliveryRecalc] Triggered: quantity or items changed");
      previousDeliveryHashRef.current = currentHash;

      const recalc = async () => {
        setIsRecalculating(true);
        try {
          const newCost = await recalculateDeliveryCost(
            wilaya,
            deliveryType,
            lineItems,
            deliveryCost,
            signal
          );
          if (!signal.aborted && newCost !== deliveryCost) {
            setDeliveryCost(newCost);
          }
        } catch (error) {
          if (error instanceof AbortError) {
            // silently ignore
          } else {
            console.error("Delivery cost recalculation failed:", error);
            toast.error("Failed to recalculate delivery cost");
          }
        } finally {
          if (!signal.aborted) setIsRecalculating(false);
        }
      };

      const timeout = setTimeout(recalc, 1000);
      return () => clearTimeout(timeout);
    },
    // Only depend on lineItems - the hash comparison inside the effect
    // determines if we actually need to recalculate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineItems, wilaya, deliveryType]
  );

  // Auto-save with 800ms debounce
  useAbortableEffect(
    (signal) => {
      if (!hasChanges || lineItems.length === 0) return;

      const autoSave = async () => {
        setIsAutoSaving(true);
        setAutoSaveError(null);
        try {
          const result = await updateLineItemsMutation({
            id: orderId,
            lineItems,
            adminName,
          });
          
          if (signal.aborted) return;
          
          setLastSavedState({ lineItems, deliveryCost });
          onSaveSuccess?.(result.newTotalAmount);
          console.log("[AutoSave] Success:", result.newTotalAmount, "DZD");
        } catch (error) {
          if (signal.aborted) return;
          
          const err = error instanceof Error ? error : new Error(String(error));
          console.error("[AutoSave] Failed:", err);
          setAutoSaveError(err);
          
          // Show error toast with retry action
          toast.error("Auto-save failed", {
            description: "Your changes weren't saved. Click retry to try again.",
            action: {
              label: "Retry",
              onClick: () => {
                // Trigger autosave by forcing a state update
                setLineItems(prev => [...prev]);
              },
            },
            duration: 10000, // Keep visible longer for retry
          });
        } finally {
          if (!signal.aborted) setIsAutoSaving(false);
        }
      };

      const timeout = setTimeout(autoSave, 800);
      return () => clearTimeout(timeout);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineItems, deliveryCost, hasChanges]
  );

  // ── Stable handlers ──────────────────────────────────────────────────────
  
  const handleQuantityChange = useCallback((index: number, quantity: number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity,
        lineTotal: quantity * updated[index].unitPrice,
      };
      return updated;
    });
  }, []);

  const handleVariantChange = useCallback(
    (index: number, variant: Record<string, string>) => {
      setLineItems((prev) => {
        const updated = [...prev];
        
        // Only update if variant actually changed to avoid unnecessary renders
        if (JSON.stringify(updated[index].variants) === JSON.stringify(variant)) {
          return prev; // Return same reference — no re-render
        }
        
        // FIX Task 1.2: Recalculate lineTotal when variant changes
        // (All variants use same base price - no per-variant pricing)
        const item = updated[index];
        updated[index] = {
          ...item,
          variants: variant,
          lineTotal: item.quantity * item.unitPrice, // Ensure lineTotal stays accurate
        };
        
        return updated;
      });
    },
    []
  );

  const handleRemove = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddProduct = useCallback((newItem: LineItem) => {
    setLineItems((prev) => [...prev, newItem]);
    toast.success(`Added ${newItem.productName}`);
    setShowAddProductModal(false);
  }, []);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider">
            Order Items
          </h3>
          {isAutoSaving && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#AAAAAA] animate-in fade-in">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {!hasChanges && !isAutoSaving && !autoSaveError && lastSavedState.lineItems.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 animate-in fade-in">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
          {autoSaveError && !isAutoSaving && (
            <button
              onClick={() => setLineItems(prev => [...prev])} // Force retry
              className="flex items-center gap-1.5 text-[11px] text-rose-600 hover:text-rose-700 transition-colors animate-in fade-in"
              title="Click to retry save"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Failed - Click to retry</span>
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddProductModal(true)}
          disabled={isAutoSaving}
          className="gap-2 h-8 text-[13px]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        {lineItems.map((item, index) => (
          <MemoizedLineItemRow
            key={`${item.productId}-${index}`}
            item={item}
            index={index}
            onQuantityChange={handleQuantityChange}
            onVariantChange={handleVariantChange}
            onRemove={handleRemove}
            disabled={isAutoSaving}
          />
        ))}

        {lineItems.length === 0 && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#ECECEC] rounded-xl text-[#AAAAAA] text-[13px]">
            No items. Click &ldquo;Add Product&rdquo; to start.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-4 border-t border-[#ECECEC]">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#555555]">Subtotal</span>
          <span className="font-semibold text-[#3A3A3A]">
            {subtotal.toLocaleString()} DZD
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-[#555555] flex items-center gap-2">
            Delivery ({deliveryType})
            {isRecalculating && <Loader2 className="w-3 h-3 animate-spin" />}
          </span>
          <span className="font-semibold text-[#3A3A3A]">
            {deliveryCost.toLocaleString()} DZD
          </span>
        </div>
        <div className="flex justify-between text-[16px] pt-2 border-t border-[#ECECEC]">
          <span className="font-bold text-[#3A3A3A]">Total</span>
          <span className="font-black text-[18px] text-[#3A3A3A] tracking-tighter">
            {total.toLocaleString()} DZD
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        open={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAddProduct}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MemoizedLineItemRow
// ─────────────────────────────────────────────────────────────────────────────

interface MemoizedLineItemRowProps {
  item: LineItem;
  index: number;
  onQuantityChange: (index: number, quantity: number) => void;
  onVariantChange: (index: number, variant: Record<string, string>) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}

const MemoizedLineItemRow = React.memo(
  function MemoizedLineItemRowInner({
    item,
    index,
    onQuantityChange,
    onVariantChange,
    onRemove,
    disabled,
  }: MemoizedLineItemRowProps) {
    const handleQty = useCallback(
      (qty: number) => onQuantityChange(index, qty),
      [onQuantityChange, index]
    );
    const handleVariant = useCallback(
      (variant: Record<string, string>) => onVariantChange(index, variant),
      [onVariantChange, index]
    );
    const handleRemoveCb = useCallback(
      () => onRemove(index),
      [onRemove, index]
    );

    return (
      <LineItemRow
        item={item}
        onQuantityChange={handleQty}
        onVariantChange={handleVariant}
        onRemove={handleRemoveCb}
        disabled={disabled}
      />
    );
  }
);
