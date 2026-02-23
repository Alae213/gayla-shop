"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingOrderCard } from "../ui/tracking-order-card";
import { TrackingCheckbox } from "../ui/tracking-checkbox";
import { TrackingButton } from "../ui/tracking-button";
import { formatDistanceToNow } from "date-fns";

export type Order = any; // Will be typed based on Convex schema in production

interface TrackingKanbanBoardProps {
  orders: Order[];
  selectedIds: Set<Id<"orders">>;
  onToggleSelect: (id: Id<"orders">) => void;
  onSelectAll: (ids: Id<"orders">[]) => void;
  onOrderClick: (id: Id<"orders">) => void;
}

const KANBAN_COLUMNS = [
  { id: "new", title: "new" },
  { id: "confirmed", title: "confirmed" },
  { id: "packaged", title: "packaged" },
  { id: "shipped", title: "shipped" }
];

export function TrackingKanbanBoard({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOrderClick
}: TrackingKanbanBoardProps) {

  // Group orders by status
  const columns = KANBAN_COLUMNS.map(col => ({
    ...col,
    items: orders.filter(o => o.status === col.id)
  }));

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4">
      {columns.map(column => {
        const columnOrderIds = column.items.map(o => o._id);
        const isAllSelected = columnOrderIds.length > 0 && columnOrderIds.every(id => selectedIds.has(id));
        const hasSelected = columnOrderIds.some(id => selectedIds.has(id));
        
        const totalValue = column.items.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return (
          <div key={column.id} className="flex flex-col w-[320px] shrink-0">
            {/* Column Header */}
            <div className="group relative flex items-center justify-between mb-4 px-2 py-1">
              <div className="flex items-center gap-3">
                <TrackingCheckbox 
                  checked={isAllSelected}
                  onCheckedChange={() => onSelectAll(columnOrderIds)}
                  aria-label={`Select all ${column.title} orders`}
                  className={isAllSelected || hasSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                />
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-[#3A3A3A] lowercase m-0">{column.title}</h3>
                  <span className="flex items-center justify-center bg-[#ECECEC] text-[#AAAAAA] text-[12px] font-medium h-6 min-w-[24px] px-1.5 rounded-full">
                    {column.items.length}
                  </span>
                </div>
              </div>
              
              {/* Tooltip on hover showing total value */}
              <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-tracking-elevated px-3 py-1.5 rounded-md text-[13px] font-medium text-[#3A3A3A] pointer-events-none z-10 whitespace-nowrap -top-10">
                {totalValue.toLocaleString()} DZD
              </div>
            </div>

            {/* Column Items */}
            <div className="flex flex-col gap-4 overflow-y-auto h-full px-1 pb-12 rounded-xl">
              {column.items.map(order => (
                <TrackingOrderCard
                  key={order._id}
                  orderNumber={order.orderNumber}
                  customerName={order.customerName}
                  totalPrice={order.totalAmount || 0}
                  status={order.status}
                  date={formatDistanceToNow(order._creationTime, { addSuffix: true })}
                  selected={selectedIds.has(order._id)}
                  onSelectChange={() => onToggleSelect(order._id)}
                  onCardClick={() => onOrderClick(order._id)}
                />
              ))}

              {column.items.length === 0 && (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#ECECEC] rounded-tracking-card bg-transparent">
                  <p className="text-[14px] text-[#AAAAAA]">No orders</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}