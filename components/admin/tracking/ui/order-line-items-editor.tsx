"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Plus, Save, X, Loader2, Check } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [lastSavedState, setLastSavedState] = useState({ lineItems: initialLineItems, deliveryCost: initialDeliveryCost });

  // Keep a ref of initial values so we can compare without them being deps
  const initialLineItemsRef = useRef(initialLineItems);
  const initialDeliveryCostRef = useRef(initialDeliveryCost);

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

  // Auto-recalculate delivery cost when line items change.
  // IMPORTANT: do NOT include hasChanges in deps — it is computed from lineItems
  // and would cause a secondary re-run every time deliveryCost is set.
  useAbortableEffect(
    (signal) => {
      // Skip recalc on initial mount (nothing changed yet)
      const isInitial =
        JSON.stringify(lineItems) ===
        JSON.stringify(initialLineItemsRef.current);
      if (isInitial || lineItems.length === 0) return;

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
          }
        } finally {
          if (!signal.aborted) setIsRecalculating(false);
        }
      };

      const timeout = setTimeout(recalc, 1000);
      return () => clearTimeout(timeout);
    },
    // deliveryCost intentionally excluded — we only want to recalc when
    // lineItems / wilaya / deliveryType change, not when deliveryCost itself
    // changes (that would create a feedback loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineItems, wilaya, deliveryType]
  );

  // Auto-save with 800ms debounce
  useEffect(() => {
    if (!hasChanges || lineItems.length === 0) return;

    const autoSave = async () => {
      setIsAutoSaving(true);
      try {
        const result = await updateLineItemsMutation({
          id: orderId,
          lineItems,
          adminName,
        });
        setLastSavedState({ lineItems, deliveryCost });
        onSaveSuccess?.(result.newTotalAmount);
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Auto-save failed");
      } finally {
        setIsAutoSaving(false);
      }
    };

    const timeout = setTimeout(autoSave, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineItems, deliveryCost]);

  // ── Stable handlers ──────────────────────────────────────────────────────
  // Using the functional updater form (prev => ...) means these callbacks
  // do NOT need lineItems in their closure, so they never re-create on each
  // render. This breaks the loop:
  //   onVariantChange prop changes → VariantSelectorDropdown re-renders
  //   → Select fires onValueChange → setLineItems → re-render → repeat

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
        if (
          JSON.stringify(updated[index].variants) === JSON.stringify(variant)
        ) {
          return prev; // Return same reference — no re-render
        }
        updated[index] = { ...updated[index], variants: variant };
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

  const handleSave = async () => {
    if (lineItems.length === 0) {
      toast.error("Order must have at least one product");
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateLineItemsMutation({
        id: orderId,
        lineItems,
        adminName,
      });
      setLastSavedState({ lineItems, deliveryCost });
      toast.success("Order items updated");
      onSaveSuccess?.(result.newTotalAmount);
    } catch (error) {
      console.error("Failed to save line items:", error);
      toast.error("Failed to update order items");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLineItems(lastSavedState.lineItems);
    setDeliveryCost(lastSavedState.deliveryCost);
    toast.info("Changes discarded");
  };

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
          {!hasChanges && !isAutoSaving && lastSavedState.lineItems.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 animate-in fade-in">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddProductModal(true)}
          disabled={isSaving || isAutoSaving}
          className="gap-2 h-8 text-[13px]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <MemoizedLineItemRow
            key={`${item.productId}-${index}`}
            item={item}
            index={index}
            onQuantityChange={handleQuantityChange}
            onVariantChange={handleVariantChange}
            onRemove={handleRemove}
            disabled={isSaving || isAutoSaving}
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

      {/* Save/Discard Buttons (shown only when there are pending changes) */}
      {hasChanges && (
        <div className="flex gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            disabled={isSaving || isAutoSaving}
            className="flex-1 h-10"
          >
            <X className="w-4 h-4 mr-2" />
            Discard Changes
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isAutoSaving || lineItems.length === 0}
            className="flex-[2] h-10 gap-2 bg-[#3A3A3A] hover:bg-[#2A2A2A]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Now
          </Button>
        </div>
      )}

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
// Wraps LineItemRow and accepts stable index-based callbacks instead of
// inline arrow functions. React.memo ensures it only re-renders when item
// data or the disabled flag actually changes.
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
    // These callbacks are stable because onQuantityChange etc. never change
    // (they are useCallback with [] deps in the parent).
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
