"use client";

/**
 * OrderLineItemEditor - Admin component for editing order line items
 * Allows add/remove/update products, quantities, and variants
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Minus,
  Plus,
  Trash2,
  Save,
  ShoppingCart,
  Package,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddProductModal } from "./add-product-modal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  productId: Id<"products">;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  variants?: Record<string, string>;
  lineTotal: number;
  thumbnail?: string;
}

interface OrderLineItemEditorProps {
  orderId: Id<"orders">;
  lineItems: LineItem[];
  deliveryCost: number;
  onUpdate: (lineItems: LineItem[]) => void;
  onSave: () => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderLineItemEditor({
  orderId,
  lineItems,
  deliveryCost,
  onUpdate,
  onSave,
}: OrderLineItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<LineItem[]>(lineItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const products = useQuery(api.products.list, {});

  // ─── Calculations ─────────────────────────────────────────────────────────

  const subtotal = editedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + deliveryCost;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleQuantityChange = (index: number, delta: number) => {
    const newItems = [...editedItems];
    const newQty = Math.max(1, newItems[index].quantity + delta);
    newItems[index] = {
      ...newItems[index],
      quantity: newQty,
      lineTotal: newQty * newItems[index].unitPrice,
    };
    setEditedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (editedItems.length === 1) {
      toast.error("Cannot remove the last item");
      return;
    }
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleAddProduct = (newItem: LineItem) => {
    setEditedItems([...editedItems, newItem]);
    toast.success("Product added to order");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUpdate(editedItems);
      await onSave();
      setIsEditing(false);
      toast.success("Order items updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedItems(lineItems);
    setIsEditing(false);
  };

  const hasChanges = JSON.stringify(editedItems) !== JSON.stringify(lineItems);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-600" />
          Order Items
        </h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Items
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {(isEditing ? editedItems : lineItems).map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 space-y-3"
          >
            {/* Product Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {/* Thumbnail */}
                {item.thumbnail && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {item.productName}
                  </p>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {Object.entries(item.variants).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {item.unitPrice.toLocaleString()} DA each
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quantity & Total */}
            <div className="flex items-center justify-between">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">Quantity</Label>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(index, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(index, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium text-sm">
                    × {item.quantity}
                  </span>
                )}
              </div>

              {/* Line Total */}
              <div className="text-right">
                <p className="text-xs text-gray-500">Line Total</p>
                <p className="font-bold text-gray-900">
                  {item.lineTotal.toLocaleString()} DA
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Add Product Button */}
        {isEditing && (
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Package className="h-4 w-4" />
            Add Product to Order
          </Button>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-100 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({editedItems.length} items)</span>
          <span>{subtotal.toLocaleString()} DA</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery</span>
          <span>+ {deliveryCost.toLocaleString()} DA</span>
        </div>
        <div className="border-t border-indigo-200 my-2 pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total COD</span>
          <span className="font-bold text-xl text-gray-900">
            {total.toLocaleString()} DA
          </span>
        </div>
        {hasChanges && isEditing && (
          <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Unsaved changes — click "Save Changes" to apply
          </p>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
