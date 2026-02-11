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

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered";

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
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}

// Status configuration
const statusConfig: Record<OrderStatus, { color: string; bgColor: string; icon: string }> = {
  Pending: { color: "text-yellow-700", bgColor: "bg-yellow-50", icon: "⏳" },
  Confirmed: { color: "text-blue-700", bgColor: "bg-blue-50", icon: "✓" },
  "Called no respond": { color: "text-orange-700", bgColor: "bg-orange-50", icon: "📞" },
  Cancelled: { color: "text-red-700", bgColor: "bg-red-50", icon: "✕" },
  Packaged: { color: "text-purple-700", bgColor: "bg-purple-50", icon: "📦" },
  Shipped: { color: "text-indigo-700", bgColor: "bg-indigo-50", icon: "🚚" },
  Delivered: { color: "text-green-700", bgColor: "bg-green-50", icon: "✓✓" },
};

// Sortable Order Card
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
    data: {
      type: "order",
      status: order.status,
      orderId: order._id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-32 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
    >
      {/* Order Number & Delivery Type */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-semibold text-indigo-600">
          {order.orderNumber}
        </span>
        <Badge
          variant="secondary"
          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
        >
          {order.deliveryType}
        </Badge>
      </div>

      {/* Customer Name */}
      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
        {order.customerName}
      </h4>

      {/* Product Name */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-1">{order.productName}</p>

      {/* Footer: Phone & Price */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Phone className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{order.customerPhone}</span>
        </div>
        <span className="text-xs font-bold text-indigo-600">
          {order.totalAmount.toLocaleString()} DA
        </span>
      </div>

      {/* Location (if available) */}
      {order.customerWilaya && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{order.customerWilaya}</span>
        </div>
      )}
    </div>
  );
}

// Droppable Column
function KanbanColumn({
  status,
  orders,
  onOrderClick,
}: {
  status: OrderStatus;
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}) {
  const config = statusConfig[status];
  
  // Make the column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: "column",
      status: status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all flex flex-col ${
        isOver
          ? "border-indigo-400 shadow-indigo-100 scale-[1.02]"
          : "border-gray-200"
      }`}
    >
      {/* Column Header */}
      <div className={`${config.bgColor} rounded-t-xl px-4 py-3 border-b-2 border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <h3 className={`font-semibold text-sm ${config.color}`}>{status}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/60 text-gray-700 border-0 text-xs">
            {orders.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - Scrollable */}
      <SortableContext items={orders.map((o) => o._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 bg-gray-50/50 rounded-b-xl p-3 space-y-2 overflow-y-auto min-h-[400px] max-h-[calc(100vh-300px)]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Package2 className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">No orders</p>
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

// Main Kanban Component
export function OrderKanban({ orders, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<Id<"orders"> | null>(null);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const statuses: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Called no respond",
    "Cancelled",
    "Packaged",
    "Shipped",
    "Delivered",
  ];

  // Group orders by status
  const ordersByStatus = statuses.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"orders">);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      console.log("❌ No drop target");
      return;
    }

    const activeOrderId = active.id as Id<"orders">;
    const activeOrder = orders.find((o) => o._id === activeOrderId);

    if (!activeOrder) {
      console.log("❌ Active order not found");
      return;
    }

    console.log("🎯 Drag End:", {
      activeOrderId,
      activeOrderStatus: activeOrder.status,
      overId: over.id,
      overData: over.data.current,
    });

    let newStatus: OrderStatus | null = null;

    // Priority 1: Get status from over.data (works for both columns and orders)
    if (over.data.current?.status) {
      newStatus = over.data.current.status as OrderStatus;
      console.log("✅ Method 1 (from data):", newStatus);
    }
    // Priority 2: Parse from column ID
    else if (typeof over.id === "string" && over.id.startsWith("column-")) {
      const statusFromId = over.id.replace("column-", "");
      if (statuses.includes(statusFromId as OrderStatus)) {
        newStatus = statusFromId as OrderStatus;
        console.log("✅ Method 2 (from column ID):", newStatus);
      }
    }
    // Priority 3: Find the order by ID and get its status
    else {
      const overOrder = orders.find((o) => o._id === over.id);
      if (overOrder?.status) {
        newStatus = overOrder.status;
        console.log("✅ Method 3 (from order lookup):", newStatus, "- Order:", overOrder.orderNumber);
      } else {
        console.log("❌ Could not find order with ID:", over.id);
      }
    }

    // Validate status
    if (!newStatus) {
      console.error("❌ No status determined");
      toast.error("Could not determine drop target");
      return;
    }

    if (!statuses.includes(newStatus)) {
      console.error("❌ Invalid status:", newStatus);
      toast.error("Invalid status: " + newStatus);
      return;
    }

    // If status hasn't changed, do nothing
    if (newStatus === activeOrder.status) {
      console.log("ℹ️ Status unchanged:", newStatus);
      return;
    }

    console.log("🚀 Updating order:", activeOrder.orderNumber, "from", activeOrder.status, "to", newStatus);

    // Update the order status
    try {
      await updateOrderStatus({
        id: activeOrderId,
        status: newStatus,
      });
      toast.success(`Order moved to ${newStatus}`);
      console.log("✅ Update successful");
    } catch (error: any) {
      console.error("❌ Update error:", error);
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeOrder = activeId ? orders.find((o) => o._id === activeId) : null;

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              orders={ordersByStatus[status]}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeOrder && (
            <div className="bg-white border-6 border-indigo-500 rounded-lg p-3 shadow-2xl w-64 opacity-95 rotate-3 scale-105">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-indigo-600">
                  {activeOrder.orderNumber}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {activeOrder.deliveryType}
                </Badge>
              </div>
              <h4 className="font-medium text-sm text-gray-900">{activeOrder.customerName}</h4>
              <p className="text-xs text-gray-600 mt-1">{activeOrder.productName}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
