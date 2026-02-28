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

  const initialLineItemsRef = useRef(initialLineItems);
  const previousDeliveryHashRef = useRef(getDeliveryRelevantHash(initialLineItems));

  const updateLineItemsMutation = useMutation(api.orders.updateLineItems);

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

  useAbortableEffect(
    (signal) => {
      const isInitial =
        JSON.stringify(lineItems) === JSON.stringify(initialLineItemsRef.current);
      if (isInitial || lineItems.length === 0) return;

      const currentHash = getDeliveryRelevantHash(lineItems);
      const previousHash = previousDeliveryHashRef.current;
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineItems, wilaya, deliveryType]
  );

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
          
          toast.error("Auto-save failed", {
            description: "Your changes weren't saved. Click retry to try again.",
            action: {
              label: "Retry",
              onClick: () => {
                setLineItems(prev => [...prev]);
              },
            },
            duration: 10000,
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
        
        if (JSON.stringify(updated[index].variants) === JSON.stringify(variant)) {
          return prev;
        }
        
        const item = updated[index];
        updated[index] = {
          ...item,
          variants: variant,
          lineTotal: item.quantity * item.unitPrice,
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
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Order Items
          </h3>
          {isAutoSaving && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {!hasChanges && !isAutoSaving && !autoSaveError && lastSavedState.lineItems.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-success animate-in fade-in">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
          {autoSaveError && !isAutoSaving && (
            <button
              onClick={() => setLineItems(prev => [...prev])}
              className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/90 transition-colors animate-in fade-in"
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
          className="gap-2 h-8 text-sm"
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
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
            No items. Click &ldquo;Add Product&rdquo; to start.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">
            {subtotal.toLocaleString()} DZD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            Delivery ({deliveryType})
            {isRecalculating && <Loader2 className="w-3 h-3 animate-spin" />}
          </span>
          <span className="font-semibold text-foreground">
            {deliveryCost.toLocaleString()} DZD
          </span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-border">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-black text-lg text-foreground tracking-tighter">
            {total.toLocaleString()} DZD
          </span>
        </div>
      </div>

      <AddProductModal
        open={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAddProduct}
      />
    </section>
  );
}

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
