"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Package2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond" // legacy
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

/**
 * Virtual column IDs — 5-column active pipeline.
 * These are UI identifiers, NOT order statuses.
 */
type ColumnId = "Pending" | "Outreach" | "Confirmed" | "Packaged" | "Shipped";

/** All order statuses that belong to the Outreach column. */
const OUTREACH_STATUSES: OrderStatus[] = [
  "Called 01",
  "Called 02",
  "Called no respond",
];

/** Ordered pipeline columns — left to right on the board. */
const PIPELINE: ColumnId[] = [
  "Pending",
  "Outreach",
  "Confirmed",
  "Packaged",
  "Shipped",
];

/**
 * Column configuration.
 * `defaultStatus` is the status applied when a card is drag-dropped into this column.
 */
const COLUMN_CONFIG: Record<
  ColumnId,
  { label: string; icon: string; color: string; bgColor: string; defaultStatus: OrderStatus }
> = {
  Pending:   { label: "Pending",   icon: "⏳", color: "text-yellow-700", bgColor: "bg-yellow-50",  defaultStatus: "Pending"   },
  Outreach:  { label: "Outreach",  icon: "📞", color: "text-orange-700", bgColor: "bg-orange-50",  defaultStatus: "Called 01" },
  Confirmed: { label: "Confirmed", icon: "✓",  color: "text-blue-700",   bgColor: "bg-blue-50",    defaultStatus: "Confirmed" },
  Packaged:  { label: "Packaged",  icon: "📦", color: "text-purple-700", bgColor: "bg-purple-50",  defaultStatus: "Packaged"  },
  Shipped:   { label: "Shipped",   icon: "🚚", color: "text-indigo-700", bgColor: "bg-indigo-50",  defaultStatus: "Shipped"   },
};

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya?: string;
  productName: string;
  deliveryType: "Domicile" | "Stopdesk";
  totalAmount: number;
  callAttempts?: number;
  isBanned?: boolean;
  fraudScore?: number;
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}

// ─── Helper: map order → column ───────────────────────────────────────────────────────────

function getColumnId(order: Order): ColumnId | null {
  if (order.status === "Pending")                      return "Pending";
  if (OUTREACH_STATUSES.includes(order.status))        return "Outreach";
  if (order.status === "Confirmed")                    return "Confirmed";
  if (order.status === "Packaged")                     return "Packaged";
  if (order.status === "Shipped")                      return "Shipped";
  return null; // terminal — not shown in the active kanban
}

// ─── Sortable card ───────────────────────────────────────────────────────────────────

function SortableOrderCard({
  order,
  columnId,
  onClick,
}: {
  order: Order;
  columnId: ColumnId;
  onClick: () => void;
}) {
  const defaultStatus = COLUMN_CONFIG[columnId].defaultStatus;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: order._id,
      data: { type: "order", status: order.status, columnId, defaultStatus },
    });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-28 opacity-50"
      />
    );
  }

  const callAttempts = order.callAttempts ?? 0;
  const isBanned     = order.isBanned     ?? false;
  const fraudScore   = order.fraudScore   ?? 0;

  /**
   * Left-border urgency indicator — scannable at board level.
   * Priority: 2 failed calls > banned > high fraud.
   */
  const urgencyBorder =
    callAttempts >= 2
      ? "border-l-[3px] border-l-red-500"
      : isBanned
      ? "border-l-[3px] border-l-red-400"
      : fraudScore >= 3
      ? "border-l-[3px] border-l-amber-400"
      : "";

  /**
   * Pulsing outline for 2-failed-calls urgency so the card visually
   * screams "action needed" without opening it.
   */
  const pulseClass = callAttempts >= 2 ? "ring-1 ring-red-300 animate-pulse" : "";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group bg-white border border-gray-200 rounded-lg p-3
        cursor-pointer hover:shadow-md hover:border-indigo-300
        transition-all duration-200
        ${urgencyBorder} ${pulseClass}
      `}
    >
      {/* Row 1: order number + delivery badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs font-semibold text-indigo-600 truncate mr-1">
          {order.orderNumber}
        </span>
        <Badge
          variant="secondary"
          className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-0 shrink-0"
        >
          {order.deliveryType}
        </Badge>
      </div>

      {/* Level 1 — customer name (bold anchor) */}
      <h4 className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-1">
        {order.customerName}
        {isBanned && <span className="ml-1 text-xs">🚫</span>}
        {!isBanned && fraudScore >= 3 && <span className="ml-1 text-xs">⚠️</span>}
      </h4>

      {/* Level 2 — product name */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{order.productName}</p>

      {/* Outreach sub-state badge (only visible in Outreach column) */}
      {columnId === "Outreach" && (
        <div
          className={`text-xs font-medium mb-1.5 px-1.5 py-0.5 rounded-sm inline-block ${
            callAttempts >= 2
              ? "bg-red-100 text-red-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          📞 {callAttempts}/2 · 
          {order.status === "Called 01"
            ? "1st attempt"
            : order.status === "Called 02"
            ? "2nd attempt"
            : "legacy"}
        </div>
      )}

      {/* Level 3 — footer: phone + total */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[90px]">{order.customerPhone}</span>
        </div>
        <span className="text-xs font-bold text-gray-800">
          {order.totalAmount.toLocaleString()} DA
        </span>
      </div>

      {/* Level 3 — wilaya: always rendered to lock card height */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 h-4">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{order.customerWilaya || "\u00a0"}</span>
      </div>
    </div>
  );
}

// ─── Droppable column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  columnId,
  orders,
  onOrderClick,
}: {
  columnId: ColumnId;
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}) {
  const cfg = COLUMN_CONFIG[columnId];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}`,
    data: { type: "column", columnId, defaultStatus: cfg.defaultStatus },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all flex flex-col ${
        isOver ? "border-indigo-400 shadow-md shadow-indigo-100" : "border-gray-200"
      }`}
    >
      {/* Column header */}
      <div className={`${cfg.bgColor} rounded-t-xl px-4 py-3 border-b border-gray-200 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{cfg.icon}</span>
            <h3 className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</h3>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/70 text-gray-700 border-0 text-xs font-semibold"
          >
            {orders.length}
          </Badge>
        </div>
      </div>

      {/* Column body */}
      <SortableContext
        items={orders.map((o) => o._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 bg-gray-50/50 rounded-b-xl p-3 space-y-2 overflow-y-auto min-h-[380px] max-h-[calc(100vh-320px)]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <Package2 className="h-8 w-8 mb-2" />
              <p className="text-xs">Empty</p>
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order._id}
                order={order}
                columnId={columnId}
                onClick={() => onOrderClick(order._id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Main kanban ─────────────────────────────────────────────────────────────────────────

export function OrderKanban({ orders, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<Id<"orders"> | null>(null);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Group orders into the 5 active pipeline columns
  const ordersByColumn = PIPELINE.reduce(
    (acc, colId) => {
      acc[colId] = orders.filter((o) => getColumnId(o) === colId);
      return acc;
    },
    {} as Record<ColumnId, Order[]>,
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"orders">);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeOrderId = active.id as Id<"orders">;
    const activeOrder   = orders.find((o) => o._id === activeOrderId);
    if (!activeOrder) return;

    /**
     * Resolve the target status using defaultStatus (not raw status).
     * Priority:
     *  1. over.data.current.defaultStatus  (columns and cards both carry this)
     *  2. parse column-{id} string → look up COLUMN_CONFIG
     *  3. find the hovered order, get its column, get that column’s defaultStatus
     */
    let newStatus: OrderStatus | null = null;

    if (over.data.current?.defaultStatus) {
      newStatus = over.data.current.defaultStatus as OrderStatus;
    } else if (typeof over.id === "string" && over.id.startsWith("column-")) {
      const colId = over.id.replace("column-", "") as ColumnId;
      newStatus = COLUMN_CONFIG[colId]?.defaultStatus ?? null;
    } else {
      const overOrder = orders.find((o) => o._id === over.id);
      if (overOrder) {
        const colId = getColumnId(overOrder);
        if (colId) newStatus = COLUMN_CONFIG[colId].defaultStatus;
      }
    }

    if (!newStatus) return;
    // Already in target state — nothing to do
    if (newStatus === activeOrder.status) return;

    try {
      await updateOrderStatus({ id: activeOrderId, status: newStatus });
      toast.success(`Order moved to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const activeOrder = activeId ? orders.find((o) => o._id === activeId) : null;
  const activeColId = activeOrder ? getColumnId(activeOrder) : null;

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {/*
         * 5-column grid — fits on any ≥xl screen without horizontal scroll.
         * xl = 1280px, 5 equal columns ≈ 240px each.
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PIPELINE.map((colId) => (
            <KanbanColumn
              key={colId}
              columnId={colId}
              orders={ordersByColumn[colId]}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeOrder && (
            <div className="bg-white border-2 border-indigo-400 rounded-lg p-3 shadow-2xl w-52 rotate-2 scale-105">
              <span className="font-mono text-xs font-semibold text-indigo-600">
                {activeOrder.orderNumber}
              </span>
              <p className="font-semibold text-sm text-gray-900 mt-1">
                {activeOrder.customerName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{activeOrder.productName}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
