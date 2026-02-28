"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Editor } from "../../features/line-items/editor";
import { LineItem } from "../../features/line-items";

interface OrderItemsSectionProps {
  orderId: Id<"orders">;
  lineItems: LineItem[];
  deliveryCost: number;
  wilaya: string;
  deliveryType: "Stopdesk" | "Domicile";
  onSaveSuccess?: (newTotal: number) => void;
  productName?: string;
  productPrice?: number;
  selectedVariant?: { size?: string; color?: string };
  quantity?: number;
  totalAmount?: number;
}

export function OrderItemsSection({
  orderId, lineItems, deliveryCost, wilaya, deliveryType, onSaveSuccess,
  productName, productPrice, selectedVariant, quantity, totalAmount,
}: OrderItemsSectionProps) {
  if (lineItems.length > 0) {
    return (
      <section className="mb-8" aria-labelledby="line-items-heading">
        <Editor
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
  return (
    <section className="mb-8 bg-[#F7F7F7] rounded-2xl p-6 border border-[#ECECEC]" aria-labelledby="summary-heading">
      <h3 id="summary-heading" className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-6">Order Summary</h3>
      <div className="space-y-3 text-[14px] text-[#3A3A3A]">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-[16px] font-bold text-[#3A3A3A] leading-tight mb-2">{productName || "Product Name Missing"}</h4>
            {selectedVariant && (
              <div className="text-[13px] text-[#AAAAAA] mb-2">
                {selectedVariant.size && `Size: ${selectedVariant.size}`}
                {selectedVariant.size && selectedVariant.color && " | "}
                {selectedVariant.color && `Color: ${selectedVariant.color}`}
              </div>
            )}
          </div>
          <span className="text-[15px] font-semibold shrink-0 ml-4">{productPrice ?? 0} DZD</span>
        </div>
        <div className="flex justify-between text-[#AAAAAA] border-t border-[#ECECEC] pt-3 mt-3">
          <span>Delivery ({deliveryType ?? "—"})</span>
          <span>+{deliveryCost ?? 0} DZD</span>
        </div>
        <div className="flex justify-between font-bold pt-3 border-t border-[#ECECEC] mt-3">
          <span>Total (COD)</span>
          <span className="text-[18px] font-black text-[#3A3A3A] tracking-tighter">{totalAmount ?? 0} DZD</span>
        </div>
      </div>
    </section>
  );
}