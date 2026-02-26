"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { OrderLineItemsEditor } from "../../ui/order-line-items-editor";
import { LineItem } from "../../ui/line-item-row";

interface OrderItemsSectionProps {
  orderId: Id<"orders">;
  lineItems: LineItem[];
  deliveryCost: number;
  wilaya: string;
  deliveryType: "Stopdesk" | "Domicile";
  onSaveSuccess?: (newTotal: number) => void;
  
  // Legacy fallback props
  productName?: string;
  productPrice?: number;
  selectedVariant?: { size?: string; color?: string };
  quantity?: number;
  totalAmount?: number;
}

/**
 * Order Items Section
 * 
 * Displays:
 * - Line items editor (if order has lineItems)
 * - Legacy order summary (if old single-product order)
 */
export function OrderItemsSection({
  orderId,
  lineItems,
  deliveryCost,
  wilaya,
  deliveryType,
  onSaveSuccess,
  productName,
  productPrice,
  selectedVariant,
  quantity,
  totalAmount,
}: OrderItemsSectionProps) {
  if (lineItems.length > 0) {
    return (
      <section className="mb-10" aria-labelledby="line-items-heading">
        <OrderLineItemsEditor
          orderId={orderId}
          initialLineItems={lineItems}
          initialDeliveryCost={deliveryCost}
          wilaya={wilaya}
          deliveryType={deliveryType}
          adminName="Admin"
          onSaveSuccess={onSaveSuccess}
        />
      </section>
    );
  }

  // Legacy fallback
  return (
    <section
      className="mb-10 bg-[#F7F7F7] rounded-2xl p-6 border border-[#ECECEC]"
      aria-labelledby="summary-heading"
    >
      <h3
        id="summary-heading"
        className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-4"
      >
        Order Summary
      </h3>
      <div className="space-y-2 text-[14px] text-[#3A3A3A]">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-[16px] font-bold text-[#3A3A3A] leading-tight mb-1">
              {productName || "Product Name Missing"}
            </h4>
            {selectedVariant && (
              <div className="text-[13px] text-[#AAAAAA]">
                {selectedVariant.size && `Size: ${selectedVariant.size}`}
                {selectedVariant.size && selectedVariant.color && " | "}
                {selectedVariant.color && `Color: ${selectedVariant.color}`}
              </div>
            )}
          </div>
          <span className="text-[15px] font-semibold shrink-0">
            {productPrice ?? 0} DZD
          </span>
        </div>
        <div className="flex justify-between text-[#AAAAAA] border-t border-[#ECECEC] pt-2">
          <span>Delivery ({deliveryType ?? "—"})</span>
          <span>+{deliveryCost ?? 0} DZD</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t border-[#ECECEC]">
          <span>Total (COD)</span>
          <span className="text-[18px] font-black text-[#3A3A3A] tracking-tighter">
            {totalAmount ?? 0} DZD
          </span>
        </div>
      </div>
    </section>
  );
}
