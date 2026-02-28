"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Checkbox } from "../components/checkbox";
import { StatusPill } from "../components/status-pill";
import { Order, MVPStatus } from "./kanban-board";

interface ListViewProps {
  selectedStatus: MVPStatus | "all";
  searchQuery: string;
  selectedOrderIds: Set<string>;
  onOrderClick: (order: Order) => void;
  onSelectOrder: (orderId: string, selected: boolean) => void;
  onSelectAll: (orderIds: string[], allSelected: boolean) => void;
}

export function ListView({
  selectedStatus,
  searchQuery,
  selectedOrderIds,
  onOrderClick,
  onSelectOrder,
  onSelectAll,
}: ListViewProps) {
  const orders = useQuery(api.orders.list) as Order[] | undefined;

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (selectedStatus !== "all") {
      result = result.filter(o => o.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone ?? "").includes(q) ||
        (o.productName ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, selectedStatus, searchQuery]);

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.has(o._id));

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-muted z-10">
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(filteredOrders.map(o => o._id), checked)}
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Product</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Wilaya</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr
                key={order._id}
                onClick={() => onOrderClick(order)}
                className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedOrderIds.has(order._id)}
                    onCheckedChange={(checked) => onSelectOrder(order._id, checked)}
                    aria-label={`Select order ${order.orderNumber}`}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold">{order.orderNumber}</td>
                <td className="px-4 py-3 font-medium">{order.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[180px]">{order.productName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{order.customerWilaya ?? "—"}</td>
                <td className="px-4 py-3 text-right font-bold">{(order.totalAmount ?? 0).toLocaleString()} DZD</td>
                <td className="px-4 py-3"><StatusPill status={order.status} /></td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{format(order._creationTime, "MMM d")}</td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}