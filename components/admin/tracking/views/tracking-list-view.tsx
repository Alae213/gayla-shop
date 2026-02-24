"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingCheckbox } from "../ui/tracking-checkbox";
import { StatusPill, OrderStatus } from "../ui/status-pill";
import { formatDistanceToNow } from "date-fns";
import { Order } from "./tracking-kanban-board";
import { Ban, ListFilter } from "lucide-react";

interface TrackingListViewProps {
  orders: Order[];
  selectedIds: Set<Id<"orders">>;
  onToggleSelect: (id: Id<"orders">) => void;
  onSelectAll: (ids: Id<"orders">[]) => void;
  onOrderClick: (id: Id<"orders">) => void;
  isBlacklist?: boolean;
}

// Single source of truth for the column layout.
// Columns: checkbox | order# | customer | product | status | total | date
const GRID = "grid-cols-[48px_minmax(110px,1fr)_minmax(160px,1.5fr)_minmax(160px,1.5fr)_minmax(110px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)]";

export function TrackingListView({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOrderClick,
  isBlacklist = false,
}: TrackingListViewProps) {
  const orderIds = orders.map(o => o._id);
  const isAllSelected = orderIds.length > 0 && orderIds.every(id => selectedIds.has(id));

  return (
    <div className="flex flex-col h-full bg-white rounded-tracking-card border border-[#ECECEC] shadow-tracking-card overflow-hidden">

      {/* Table Header */}
      <div className={`grid ${GRID} items-center px-6 py-4 border-b border-[#ECECEC] bg-[#F7F7F7] text-[13px] font-semibold text-[#AAAAAA] uppercase tracking-wider`}>
        <div className="flex items-center justify-center">
          <TrackingCheckbox
            checked={isAllSelected}
            onCheckedChange={() => onSelectAll(orderIds)}
            aria-label={isAllSelected ? "Deselect all orders" : "Select all orders"}
          />
        </div>
        <div>Order</div>
        <div>Customer</div>
        <div>Product</div>
        <div>Status</div>
        <div>Total</div>
        <div>Date</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label={isBlacklist ? "Blacklist orders" : "Active orders"}>
        {orders.map(order => {
          const isSelected = selectedIds.has(order._id);
          const displayStatus: OrderStatus =
            (order._normalizedStatus ?? order.status ?? "new") as OrderStatus;

          const variantParts: string[] = [];
          if (order.selectedVariant?.size)  variantParts.push(order.selectedVariant.size);
          if (order.selectedVariant?.color) variantParts.push(order.selectedVariant.color);
          const variantLabel = variantParts.join(" / ");

          return (
            <div
              key={order._id}
              role="listitem"
              tabIndex={0}
              aria-label={`Order ${order.orderNumber} by ${order.customerName}, ${order.productName ?? "product"}, total ${order.totalAmount ?? 0} DZD, status ${displayStatus}`}
              onClick={() => onOrderClick(order._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOrderClick(order._id);
                }
              }}
              className={`grid ${GRID} items-center px-6 py-4 border-b border-[#ECECEC] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#AAAAAA] ${
                isSelected ? "bg-[#F5F5F5]" : "bg-white hover:bg-[#F7F7F7]"
              }`}
            >
              {/* Checkbox */}
              <div
                className="flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); onToggleSelect(order._id); }}
              >
                <TrackingCheckbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(order._id)}
                  tabIndex={-1}
                  aria-label={`Select order ${order.orderNumber}`}
                />
              </div>

              {/* Order # */}
              <div className="text-[15px] font-medium text-[#3A3A3A] font-mono">
                {order.orderNumber}
              </div>

              {/* Customer */}
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-medium text-[#3A3A3A] truncate">{order.customerName}</span>
                <span className="text-[13px] text-[#AAAAAA]">{order.customerPhone}</span>
              </div>

              {/* Product */}
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-[#3A3A3A] truncate">
                  {order.productName || <span className="text-[#CCCCCC] italic">—</span>}
                </span>
                {variantLabel && (
                  <span className="text-[12px] text-[#AAAAAA] truncate">{variantLabel}</span>
                )}
              </div>

              {/* Status */}
              <div>
                <StatusPill status={displayStatus} />
              </div>

              {/* Total */}
              <div className="text-[14px] font-medium text-[#3A3A3A]">
                {order.totalAmount ?? 0} DZD
              </div>

              {/* Date */}
              <div className="text-[13px] text-[#AAAAAA]">
                {formatDistanceToNow(order._creationTime, { addSuffix: true })}
              </div>
            </div>
          );
        })}

        {/* FIX 18A: Context-aware empty states */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 text-[#AAAAAA]"
              aria-hidden="true"
            >
              {isBlacklist
                ? <Ban className="w-8 h-8" />
                : <ListFilter className="w-8 h-8" />}
            </div>
            {isBlacklist ? (
              <>
                <h3 className="text-[16px] font-semibold text-[#3A3A3A]">Blacklist is empty</h3>
                <p className="text-[14px] text-[#AAAAAA] mt-1 max-w-xs">
                  Canceled and blocked orders will appear here.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-[16px] font-semibold text-[#3A3A3A]">No orders found</h3>
                <p className="text-[14px] text-[#AAAAAA] mt-1 max-w-xs">
                  Try adjusting your search or filter.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
