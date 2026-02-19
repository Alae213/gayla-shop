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

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

type ColumnId = "New" | "Confirmed" | "Packaged" | "Shipped";

const PIPELINE: ColumnId[] = ["New", "Confirmed", "Packaged", "Shipped"];

const COLUMN_CONFIG: Record<
  ColumnId,
  { label: string; icon: string; color: string; bgColor: string; defaultStatus: OrderStatus }
> = {
  New:       { label: "New",       icon: "🔔", color: "text-yellow-700", bgColor: "bg-yellow-50",  defaultStatus: "Pending"   },
  Confirmed: { label: "Confirmed", icon: "✓",  color: "text-blue-700",   bgColor: "bg-blue-50",    defaultStatus: "Confirmed" },
  Packaged:  { label: "Packaged",  icon: "📦", color: "text-purple-700", bgColor: "bg-purple-50",  defaultStatus: "Packaged"  },
  Shipped:   { label: "Shipped",   icon: "🚚", color: "text-indigo-700", bgColor: "bg-indigo-50",  defaultStatus: "Shipped"   },
};

const NEW_STATUSES: OrderStatus[] = [
  "Pending", "Called 01", "Called 02", "Called no respond",
];

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya?: string;
  productName: string;
  productPrice: number;
  deliveryType: "Domicile" | "Stopdesk";
  deliveryCost: number;
  totalAmount: number;
  callAttempts?: number;
  callLog?: Array<{ timestamp: number; outcome: "answered" | "no_answer" }>;
  isBanned?: boolean;
  fraudScore?: number;
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}

// ─── Helper: map order → column ──────────────────────────────────────────────

function getColumnId(order: Order): ColumnId | null {
  if (NEW_STATUSES.includes(order.status)) return "New";
  if (order.status === "Confirmed")         return "Confirmed";
  if (order.status === "Packaged")          return "Packaged";
  if (order.status === "Shipped")           return "Shipped";
  return null;
}

// ─── Call badge ───────────────────────────────────────────────────────────────

function CallBadge({ order, columnId }: { order: Order; columnId: ColumnId }) {
  if (columnId !== "New") return <div className="h-5" />;

  const callAttempts = order.callAttempts ?? 0;
  const hasAnswered  = order.callLog?.some((e) => e.outcome === "answered") ?? false;

  if (hasAnswered) {
    return (
      <div className="h-5 flex items-center">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0 rounded-sm bg-green-100 text-green-700">
          📞 ✓
        </span>
      </div>
    );
  }
  if (callAttempts >= 2) {
    return (
      <div className="h-5 flex items-center">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0 rounded-sm bg-red-100 text-red-700">
          📞 2/2 ⚠
        </span>
      </div>
    );
  }
  if (callAttempts === 1) {
    return (
      <div className="h-5 flex items-center">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0 rounded-sm bg-orange-100 text-orange-700">
          📞 1/2
        </span>
      </div>
    );
  }
  return <div className="h-5" />;
}

// ─── Sortable card ────────────────────────────────────────────────────────────

function SortableOrderCard({
  order, columnId, onClick,
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
  const hasAnswered  = order.callLog?.some((e) => e.outcome === "answered") ?? false;

  // Left-border treatment:
  // - Banned customer  → red border
  // - High fraud score → amber border
  // - 2× no-answer    → NO border (badge in row 4 is sufficient)
  const urgencyBorder =
    isBanned      ? "border-l-[3px] border-l-red-400"
    : fraudScore >= 3 ? "border-l-[3px] border-l-amber-400"
    : "";

  // No pulsing ring for any call-log state — badge communicates it clearly.
  const pulseClass = "";

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
        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-0 shrink-0">
          {order.deliveryType}
        </Badge>
      </div>

      {/* Row 2: customer name */}
      <h4 className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-1">
        {order.customerName}
        {isBanned && <span className="ml-1 text-xs">🚫</span>}
        {!isBanned && fraudScore >= 3 && <span className="ml-1 text-xs">⚠️</span>}
      </h4>

      {/* Row 3: product name */}
      <p className="text-sm text-gray-600 mb-1.5 line-clamp-1">{order.productName}</p>

      {/* Row 4: call badge (always h-5 to lock card height) */}
      <CallBadge order={order} columnId={columnId} />

      {/* Row 5: footer — phone + total */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 mt-1">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[90px]">{order.customerPhone}</span>
        </div>
        <span className="text-xs font-bold text-gray-800">
          {order.totalAmount.toLocaleString()} DA
        </span>
      </div>

      {/* Row 6: wilaya — always rendered to lock height */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 h-4">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{order.customerWilaya || "\u00a0"}</span>
      </div>
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function KanbanColumn({
  columnId, orders, onOrderClick,
}: {
  columnId: ColumnId;
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}) {
  const cfg = COLUMN_CONFIG[columnId];

  const totalDA = orders.reduce(
    (sum, o) => sum + (o.productPrice ?? 0) + (o.deliveryCost ?? 0), 0,
  );

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
      <div className={`group ${cfg.bgColor} rounded-t-xl px-4 py-3 border-b border-gray-200 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{cfg.icon}</span>
            <h3 className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</h3>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <Badge variant="secondary" className="bg-white/70 text-gray-700 border-0 text-xs font-semibold">
              {orders.length}
            </Badge>
            {orders.length > 0 && (
              <span className="text-xs text-gray-400 font-mono leading-none">
                {totalDA.toLocaleString()} DA
              </span>
            )}
          </div>
        </div>
      </div>

      <SortableContext items={orders.map((o) => o._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 bg-gray-50/50 rounded-b-xl p-3 space-y-2 overflow-y-auto min-h-[380px] max-h-[calc(100vh-320px)]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <Package2 className="h-8 w-8 mb-2" />
              <p className="text-xs">No new orders</p>
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

// ─── Main kanban ──────────────────────────────────────────────────────────────

export function OrderKanban({ orders, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<Id<"orders"> | null>(null);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ordersByColumn = PIPELINE.reduce(
    (acc, colId) => { acc[colId] = orders.filter((o) => getColumnId(o) === colId); return acc; },
    {} as Record<ColumnId, Order[]>,
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as Id<"orders">);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeOrderId = active.id as Id<"orders">;
    const activeOrder   = orders.find((o) => o._id === activeOrderId);
    if (!activeOrder) return;

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

    if (!newStatus || newStatus === activeOrder.status) return;
    try {
      await updateOrderStatus({ id: activeOrderId, status: newStatus });
      toast.success(`Order moved to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const activeOrder = activeId ? orders.find((o) => o._id === activeId) : null;

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {PIPELINE.map((colId) => (
            <KanbanColumn
              key={colId}
              columnId={colId}
              orders={ordersByColumn[colId]}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder && (
            <div className="bg-white border-2 border-indigo-400 rounded-lg p-3 shadow-2xl w-52 rotate-2 scale-105">
              <span className="font-mono text-xs font-semibold text-indigo-600">{activeOrder.orderNumber}</span>
              <p className="font-semibold text-sm text-gray-900 mt-1">{activeOrder.customerName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activeOrder.productName}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
