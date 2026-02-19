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
  // Phase 1 fields
  callAttempts?: number;
  isBanned?: boolean;
  fraudScore?: number;
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}

// ─── Status config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { color: string; bgColor: string; icon: string; headerBg: string }> = {
  Pending:            { color: "text-yellow-700", bgColor: "bg-yellow-50",  icon: "⏳",  headerBg: "bg-yellow-50" },
  "Called 01":        { color: "text-orange-700", bgColor: "bg-orange-50",  icon: "📞",  headerBg: "bg-orange-50" },
  "Called 02":        { color: "text-red-700",    bgColor: "bg-red-50",     icon: "📞",  headerBg: "bg-red-50" },
  Confirmed:          { color: "text-blue-700",   bgColor: "bg-blue-50",   icon: "✓",   headerBg: "bg-blue-50" },
  Packaged:           { color: "text-purple-700", bgColor: "bg-purple-50", icon: "📦",  headerBg: "bg-purple-50" },
  Shipped:            { color: "text-indigo-700", bgColor: "bg-indigo-50", icon: "🚚",  headerBg: "bg-indigo-50" },
  Delivered:          { color: "text-green-700",  bgColor: "bg-green-50",  icon: "✓✓", headerBg: "bg-green-50" },
  Retour:             { color: "text-slate-700",  bgColor: "bg-slate-50",  icon: "↩",  headerBg: "bg-slate-50" },
  Cancelled:          { color: "text-red-700",    bgColor: "bg-red-50",    icon: "✕",   headerBg: "bg-red-50" },
  "Called no respond":{ color: "text-orange-700", bgColor: "bg-orange-50", icon: "📞",  headerBg: "bg-orange-50" },
};

// Canonical order of columns — logical flow left to right
// Note: "Called no respond" is legacy; new orders won't use it but existing ones
// are kept visible in their own column rather than becoming orphaned.
const STATUSES: OrderStatus[] = [
  "Pending",
  "Called 01",
  "Called 02",
  "Confirmed",
  "Packaged",
  "Shipped",
  "Delivered",
  "Retour",
  "Cancelled",
  "Called no respond", // legacy — shown last
];

// ─── Sortable card ───────────────────────────────────────────────────────────────────

function SortableOrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order._id,
    data: { type: "order", status: order.status, orderId: order._id },
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

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
    >
      {/* Row 1: order number + delivery badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs font-semibold text-indigo-600 truncate mr-1">
          {order.orderNumber}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isBanned && <span title="Banned customer" className="text-xs">🚫</span>}
          {fraudScore >= 3 && <span title="High fraud score" className="text-xs">⚠️</span>}
          <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-0">
            {order.deliveryType}
          </Badge>
        </div>
      </div>

      {/* Customer name */}
      <h4 className="font-medium text-sm text-gray-900 mb-0.5 line-clamp-1">
        {order.customerName}
      </h4>

      {/* Product name */}
      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{order.productName}</p>

      {/* Call attempts indicator */}
      {callAttempts > 0 && (
        <div className={`text-xs font-medium mb-2 px-1.5 py-0.5 rounded inline-block ${
          callAttempts >= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
        }`}>
          📞 {callAttempts}/2 no answer
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Phone className="h-3 w-3" />
          <span className="truncate max-w-[90px]">{order.customerPhone}</span>
        </div>
        <span className="text-xs font-bold text-indigo-600">
          {order.totalAmount.toLocaleString()} DA
        </span>
      </div>

      {order.customerWilaya && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{order.customerWilaya}</span>
        </div>
      )}
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  orders,
  onOrderClick,
}: {
  status: OrderStatus;
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}) {
  const cfg = statusConfig[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all flex flex-col h-full ${
        isOver ? "border-indigo-400 shadow-indigo-100 scale-[1.01]" : "border-gray-200"
      }`}
    >
      {/* Column header */}
      <div className={`${cfg.headerBg} rounded-t-xl px-3 py-2.5 border-b border-gray-200 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{cfg.icon}</span>
            <h3 className={`font-semibold text-xs truncate ${cfg.color}`}>
              {status === "Called no respond" ? "Legacy" : status}
            </h3>
          </div>
          <Badge variant="secondary" className="bg-white/70 text-gray-600 border-0 text-xs px-1.5 py-0 shrink-0">
            {orders.length}
          </Badge>
        </div>
      </div>

      {/* Column body */}
      <SortableContext items={orders.map((o) => o._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 bg-gray-50/50 rounded-b-xl p-2.5 space-y-2 overflow-y-auto min-h-[320px] max-h-[calc(100vh-320px)]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <Package2 className="h-7 w-7 mb-1.5" />
              <p className="text-xs">Empty</p>
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order._id}
                order={order}
                onClick={() => onOrderClick(order._id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Main Kanban ────────────────────────────────────────────────────────────────────────

export function OrderKanban({ orders, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<Id<"orders"> | null>(null);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Group orders by status
  const ordersByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status);
      return acc;
    },
    {} as Record<OrderStatus, Order[]>,
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

    let newStatus: OrderStatus | null = null;

    if (over.data.current?.status) {
      newStatus = over.data.current.status as OrderStatus;
    } else if (typeof over.id === "string" && over.id.startsWith("column-")) {
      const s = over.id.replace("column-", "");
      if (STATUSES.includes(s as OrderStatus)) newStatus = s as OrderStatus;
    } else {
      const overOrder = orders.find((o) => o._id === over.id);
      if (overOrder?.status) newStatus = overOrder.status;
    }

    if (!newStatus || !STATUSES.includes(newStatus)) return;
    if (newStatus === activeOrder.status) return;

    try {
      await updateOrderStatus({ id: activeOrderId, status: newStatus });

      if (newStatus === "Retour") {
        toast.success("↩ Moved to Retour. Open the order to add a reason.");
      } else if (newStatus === "Cancelled") {
        toast.success("✕ Order cancelled via drag. Open it to add a reason.");
      } else {
        toast.success(`Order moved to ${newStatus}`);
      }
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
        {/* Horizontally scrollable board — 10 columns at 220px each */}
        <div className="w-full overflow-x-auto pb-4">
          <div
            className="flex gap-3"
            style={{ minWidth: `${STATUSES.length * 232}px` }}
          >
            {STATUSES.map((status) => (
              <div key={status} className="w-[220px] shrink-0 flex flex-col">
                <KanbanColumn
                  status={status}
                  orders={ordersByStatus[status]}
                  onOrderClick={onOrderClick}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeOrder && (
            <div className="bg-white border-2 border-indigo-400 rounded-lg p-3 shadow-2xl w-52 rotate-2 scale-105">
              <span className="font-mono text-xs font-semibold text-indigo-600">{activeOrder.orderNumber}</span>
              <p className="font-medium text-sm text-gray-900 mt-1">{activeOrder.customerName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activeOrder.productName}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
