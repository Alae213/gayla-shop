"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { OrderCard } from "../components/order-card";
import { Checkbox } from "../components/checkbox";

export type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

export interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerWilaya?: string;
  customerCommune?: string;
  productName?: string;
  productPrice?: number;
  totalAmount?: number;
  deliveryCost?: number;
  deliveryType?: "Stopdesk" | "Domicile";
  selectedVariant?: { size?: string; color?: string };
  quantity?: number;
  thumbnail?: string;
  notes?: string;
  status: MVPStatus;
  callLog?: Array<{ timestamp: number; outcome: "answered" | "no answer" | "wrong number" | "refused"; note?: string }>;
  callAttempts?: number;
  cancelReason?: string;
  statusHistory?: Array<{ status: string; timestamp: number; reason?: string }>;
  courierTrackingId?: string;
  lineItems?: Array<{
    productId: Id<"products">;
    productName: string;
    productSlug?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    variants?: Record<string, string>;
    thumbnail?: string;
  }>;
}

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

const STATUS_ORDER: MVPStatus[] = ["new", "confirmed", "packaged", "shipped", "canceled", "blocked", "hold"];

const STATUS_LABELS: Record<MVPStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  packaged: "Packaged",
  shipped: "Shipped",
  canceled: "Canceled",
  blocked: "Blocked",
  hold: "Hold",
};

interface KanbanBoardProps {
  selectedStatus: MVPStatus | "all";
  searchQuery: string;
  selectedOrderIds: Set<string>;
  onOrderClick: (order: Order) => void;
  onSelectOrder: (orderId: string, selected: boolean) => void;
  onSelectAll: (orderIds: string[], allSelected: boolean) => void;
}

export function KanbanBoard({
  selectedStatus,
  searchQuery,
  selectedOrderIds,
  onOrderClick,
  onSelectOrder,
  onSelectAll,
}: KanbanBoardProps) {
  const orders = useQuery(api.orders.list) as Order[] | undefined;
  const [expandedColumns, setExpandedColumns] = useState<Set<MVPStatus>>(new Set());

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
        (o.productName ?? "").toLowerCase().includes(q) ||
        (o.customerWilaya ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, selectedStatus, searchQuery]);

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        </div>
      </div>
    );
  }

  if (selectedStatus !== "all") {
    const columnOrders = filteredOrders;
    const allSelected = columnOrders.length > 0 && columnOrders.every(o => selectedOrderIds.has(o._id));
    const someSelected = columnOrders.some(o => selectedOrderIds.has(o._id));
    const PREVIEW_COUNT = 20;
    const isExpanded = expandedColumns.has(selectedStatus);
    const visibleOrders = isExpanded ? columnOrders : columnOrders.slice(0, PREVIEW_COUNT);
    const hiddenCount = columnOrders.length - PREVIEW_COUNT;

    return (
      <div className="flex flex-col h-full">
        {columnOrders.length > 0 && (
          <div className="flex items-center gap-2 px-1 pb-3 shrink-0">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectAll(columnOrders.map(o => o._id), checked)}
              aria-label={allSelected ? "Deselect all" : "Select all"}
            />
            <span className="text-xs text-muted-foreground">
              {someSelected
                ? `${columnOrders.filter(o => selectedOrderIds.has(o._id)).length} selected`
                : `${columnOrders.length} order${columnOrders.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}
        <div role="list" className="flex-1 overflow-y-auto space-y-3 pr-1">
          {visibleOrders.map(order => {
            const firstItem = order.lineItems?.[0];
            const moreItemsCount = (order.lineItems?.length ?? 0) > 1 ? (order.lineItems!.length - 1) : 0;
            const variantEntries = firstItem?.variants ? Object.entries(firstItem.variants) : [];
            const variantLabel = variantEntries.length > 0 ? variantEntries.map(([, v]) => v).join(" / ") : undefined;
            const productName = firstItem?.productName ?? order.productName;
            const thumbnail = firstItem?.thumbnail ?? order.thumbnail;
            const quantity = firstItem ? firstItem.quantity : order.quantity;

            return (
              <OrderCard
                key={order._id}
                orderNumber={order.orderNumber}
                customerName={order.customerName}
                productName={productName}
                thumbnail={thumbnail}
                wilaya={order.customerWilaya}
                deliveryType={order.deliveryType}
                quantity={quantity}
                variantLabel={variantLabel}
                moreItemsCount={moreItemsCount}
                callLog={order.callLog}
                showCallLog={order.status === "new" || order.status === "hold"}
                totalPrice={order.totalAmount ?? 0}
                status={order.status}
                date={format(order._creationTime, "MMM d")}
                selected={selectedOrderIds.has(order._id)}
                onSelectChange={(sel) => onSelectOrder(order._id, sel)}
                onCardClick={() => onOrderClick(order)}
              />
            );
          })}

          {columnOrders.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No orders
            </div>
          )}

          {!isExpanded && hiddenCount > 0 && (
            <button
              onClick={() => setExpandedColumns(prev => new Set([...prev, selectedStatus]))}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg"
            >
              Show {hiddenCount} more
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 h-full overflow-x-auto">
      {STATUS_ORDER.map((status) => {
        const columnOrders = filteredOrders.filter(o => o.status === status);
        const allSelected = columnOrders.length > 0 && columnOrders.every(o => selectedOrderIds.has(o._id));
        const someSelected = columnOrders.some(o => selectedOrderIds.has(o._id));
        const PREVIEW_COUNT = 5;
        const isExpanded = expandedColumns.has(status);
        const visibleOrders = isExpanded ? columnOrders : columnOrders.slice(0, PREVIEW_COUNT);
        const hiddenCount = columnOrders.length - PREVIEW_COUNT;

        return (
          <div key={status} className="flex flex-col min-w-[200px] xl:min-w-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              {columnOrders.length > 0 && (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(columnOrders.map(o => o._id), checked)}
                  aria-label={allSelected ? `Deselect all ${STATUS_LABELS[status]}` : `Select all ${STATUS_LABELS[status]}`}
                />
              )}
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex-1">
                {STATUS_LABELS[status]}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-mono">
                {columnOrders.length}
              </span>
            </div>

            <div role="list" className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-full">
              {visibleOrders.map(order => {
                const firstItem = order.lineItems?.[0];
                const moreItemsCount = (order.lineItems?.length ?? 0) > 1 ? (order.lineItems!.length - 1) : 0;
                const variantEntries = firstItem?.variants ? Object.entries(firstItem.variants) : [];
                const variantLabel = variantEntries.length > 0 ? variantEntries.map(([, v]) => v).join(" / ") : undefined;
                const productName = firstItem?.productName ?? order.productName;
                const thumbnail = firstItem?.thumbnail ?? order.thumbnail;
                const quantity = firstItem ? firstItem.quantity : order.quantity;

                return (
                  <OrderCard
                    key={order._id}
                    orderNumber={order.orderNumber}
                    customerName={order.customerName}
                    productName={productName}
                    thumbnail={thumbnail}
                    wilaya={order.customerWilaya}
                    deliveryType={order.deliveryType}
                    quantity={quantity}
                    variantLabel={variantLabel}
                    moreItemsCount={moreItemsCount}
                    callLog={order.callLog}
                    showCallLog={order.status === "new" || order.status === "hold"}
                    totalPrice={order.totalAmount ?? 0}
                    status={order.status}
                    date={format(order._creationTime, "MMM d")}
                    selected={selectedOrderIds.has(order._id)}
                    onSelectChange={(sel) => onSelectOrder(order._id, sel)}
                    onCardClick={() => onOrderClick(order)}
                  />
                );
              })}

              {columnOrders.length === 0 && (
                <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                  Empty
                </div>
              )}

              {!isExpanded && hiddenCount > 0 && (
                <button
                  onClick={() => setExpandedColumns(prev => new Set([...prev, status]))}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  +{hiddenCount} more
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}