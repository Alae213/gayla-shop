"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { Plus, Save, X, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LineItem, LineItemRow } from "./line-item-row";
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
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const updateLineItemsMutation = useMutation(api.orders.updateLineItems);

  // Detect if changes have been made
  const hasChanges = React.useMemo(() => {
    if (lineItems.length !== initialLineItems.length) return true;
    return JSON.stringify(lineItems) !== JSON.stringify(initialLineItems) ||
           deliveryCost !== initialDeliveryCost;
  }, [lineItems, initialLineItems, deliveryCost, initialDeliveryCost]);

  // Calculate subtotal and total
  const subtotal = React.useMemo(
    () => lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [lineItems]
  );
  const total = subtotal + deliveryCost;

  // Auto-recalculate delivery cost when line items change (with AbortSignal)
  useAbortableEffect((signal) => {
    const recalc = async () => {
      // Only recalc if lineItems changed and not initial load
      if (!hasChanges || lineItems.length === 0) return;

      setIsRecalculating(true);
      try {
        const newCost = await recalculateDeliveryCost(
          wilaya,
          deliveryType,
          lineItems,
          deliveryCost, // fallback
          signal
        );
        
        // Check if still mounted and not aborted
        if (!signal.aborted && newCost !== deliveryCost) {
          setDeliveryCost(newCost);
          toast.info(`Delivery cost updated: ${newCost.toLocaleString()} DZD`);
        }
      } catch (error) {
        // Silently ignore abort errors
        if (error instanceof AbortError) {
          console.log("Delivery recalculation cancelled");
        } else {
          console.error("Delivery cost recalculation failed:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsRecalculating(false);
        }
      }
    };

    // Debounce: only recalc after 1 second of no changes
    const timeout = setTimeout(recalc, 1000);
    return () => clearTimeout(timeout);
  }, [lineItems, wilaya, deliveryType, hasChanges]);

  // Handlers
  const handleQuantityChange = useCallback((index: number, quantity: number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity,
        lineTotal: quantity * updated[index].unitPrice,
      };
      return updated;
    });
  }, []);

  const handleVariantChange = useCallback((index: number, variant: Record<string, string>) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], variants: variant };
      return updated;
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddProduct = useCallback((newItem: LineItem) => {
    setLineItems(prev => [...prev, newItem]);
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
    setLineItems(initialLineItems);
    setDeliveryCost(initialDeliveryCost);
    toast.info("Changes discarded");
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider">
          Order Items
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddProductModal(true)}
          disabled={isSaving}
          className="gap-2 h-8 text-[13px]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <LineItemRow
            key={`${item.productId}-${index}`}
            item={item}
            onQuantityChange={(qty) => handleQuantityChange(index, qty)}
            onVariantChange={(variant) => handleVariantChange(index, variant)}
            onRemove={() => handleRemove(index)}
            disabled={isSaving}
          />
        ))}

        {lineItems.length === 0 && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#ECECEC] rounded-xl text-[#AAAAAA] text-[13px]">
            No items. Click "Add Product" to start.
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

      {/* Save/Discard Buttons */}
      {hasChanges && (
        <div className="flex gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex-1 h-10"
          >
            <X className="w-4 h-4 mr-2" />
            Discard Changes
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || lineItems.length === 0}
            className="flex-[2] h-10 gap-2 bg-[#3A3A3A] hover:bg-[#2A2A2A]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      )}

      {/* TODO: Add Product Modal Integration */}
      {showAddProductModal && (
        <div className="text-[13px] text-amber-600 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <strong>Note:</strong> Add Product modal integration pending.
          Use existing components/admin/add-product-modal.tsx.
        </div>
      )}
    </section>
  );
}
