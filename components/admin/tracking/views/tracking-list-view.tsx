"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingCheckbox } from "../ui/tracking-checkbox";
import { StatusPill, OrderStatus } from "../ui/status-pill";
import { formatDistanceToNow } from "date-fns";
import { Order } from "./tracking-kanban-board";

interface TrackingListViewProps {
  orders: Order[];
  selectedIds: Set<Id<"orders">>;
  onToggleSelect: (id: Id<"orders">) => void;
  onSelectAll: (ids: Id<"orders">[]) => void;
  onOrderClick: (id: Id<"orders">) => void;
  isBlacklist?: boolean;
}

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
  const hasSelected = orderIds.some(id => selectedIds.has(id));

  return (
    <div className="flex flex-col h-full bg-white rounded-tracking-card border border-[#ECECEC] shadow-tracking-card overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[48px_minmax(120px,1fr)_minmax(180px,2fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)] items-center px-6 py-4 border-b border-[#ECECEC] bg-[#F7F7F7] text-[13px] font-semibold text-[#AAAAAA] uppercase tracking-wider">
        <div className="flex items-center justify-center">
          <TrackingCheckbox
            checked={isAllSelected}
            onCheckedChange={() => onSelectAll(orderIds)}
            aria-label={isAllSelected ? "Deselect all orders" : "Select all orders"}
          />
        </div>
        <div>Order</div>
        <div>Customer</div>
        <div>Status</div>
        <div>Total</div>
        <div>Date</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label={isBlacklist ? "Blacklist orders" : "Active orders"}>
        {orders.map(order => {
          const isSelected = selectedIds.has(order._id);
          // Use _normalizedStatus injected by TrackingWorkspace; fall back to raw status
          const displayStatus: OrderStatus =
            (order._normalizedStatus ?? order.status ?? "new") as OrderStatus;

          return (
            <div
              key={order._id}
              role="listitem"
              tabIndex={0}
              aria-label={`Order ${order.orderNumber} by ${order.customerName}, total ${order.totalAmount ?? 0} DZD, status ${displayStatus}`}
              onClick={() => onOrderClick(order._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOrderClick(order._id);
                }
              }}
              className={`grid grid-cols-[48px_minmax(120px,1fr)_minmax(180px,2fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)] items-center px-6 py-4 border-b border-[#ECECEC] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#AAAAAA] ${
                isSelected ? "bg-[#F5F5F5]" : "bg-white hover:bg-[#F7F7F7]"
              }`}
            >
              <div
                className="flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(order._id);
                }}
              >
                <TrackingCheckbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(order._id)}
                  tabIndex={-1}
                  aria-label={`Select order ${order.orderNumber}`}
                />
              </div>
              <div className="text-[15px] font-medium text-[#3A3A3A]">{order.orderNumber}</div>
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-[#3A3A3A]">{order.customerName}</span>
                <span className="text-[13px] text-[#AAAAAA]">{order.customerPhone}</span>
              </div>
              <div>
                <StatusPill status={displayStatus} />
              </div>
              <div className="text-[14px] font-medium text-[#3A3A3A]">{order.totalAmount ?? 0} DZD</div>
              <div className="text-[13px] text-[#AAAAAA]">
                {formatDistanceToNow(order._creationTime, { addSuffix: true })}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 text-[#AAAAAA]" aria-hidden="true">
              {isBlacklist ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                </svg>
              )}
            </div>
            <h3 className="text-[16px] font-semibold text-[#3A3A3A]">No orders found</h3>
            <p className="text-[14px] text-[#AAAAAA] mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
