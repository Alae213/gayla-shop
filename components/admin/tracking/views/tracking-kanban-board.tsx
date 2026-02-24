"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingOrderCard } from "../ui/tracking-order-card";
import { TrackingCheckbox } from "../ui/tracking-checkbox";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export type Order = any;

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface TrackingKanbanBoardProps {
  orders: Order[];
  selectedIds: Set<Id<"orders">>;
  onToggleSelect: (id: Id<"orders">) => void;
  onSelectAll: (ids: Id<"orders">[]) => void;
  onOrderClick: (id: Id<"orders">) => void;
  blacklistCount?: number;
}

const KANBAN_COLUMNS: { id: MVPStatus; title: string }[] = [
  { id: "new",       title: "new" },
  { id: "confirmed", title: "confirmed" },
  { id: "packaged",  title: "packaged" },
  { id: "shipped",   title: "shipped" },
];

// ── Draggable card wrapper
function SortableOrderCard({
  order,
  selected,
  onSelectChange,
  onCardClick,
}: {
  order: Order;
  selected: boolean;
  onSelectChange: () => void;
  onCardClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order._id,
    data: { order },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TrackingOrderCard
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        totalPrice={order.totalAmount ?? 0}
        status={order._normalizedStatus ?? order.status ?? "new"}
        date={formatDistanceToNow(order._creationTime, { addSuffix: true })}
        selected={selected}
        onSelectChange={onSelectChange}
        onCardClick={onCardClick}
      />
    </div>
  );
}

export function TrackingKanbanBoard({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOrderClick,
  blacklistCount = 0,
}: TrackingKanbanBoardProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const updateStatus = useMutation(api.orders.updateStatus);

  const getColumn = (o: Order): MVPStatus =>
    (o._normalizedStatus ?? o.status ?? "new") as MVPStatus;

  const columns = KANBAN_COLUMNS.map(col => ({
    ...col,
    items: orders.filter(o => getColumn(o) === col.id),
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const order = orders.find(o => o._id === event.active.id);
    setActiveOrder(order ?? null);
  }, [orders]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Determine target column
    const orderId = active.id as string;
    const targetColumnId = over.id as MVPStatus;
    const validColumns = new Set(KANBAN_COLUMNS.map(c => c.id));
    if (!validColumns.has(targetColumnId)) return;

    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const currentStatus = getColumn(order);
    if (currentStatus === targetColumnId) return;

    // Status advancement: only allow forward moves, not backward except within KANBAN_COLUMNS
    // Allow any cross-column move for admin flexibility
    try {
      await updateStatus({ id: orderId as Id<"orders">, status: targetColumnId });
      toast.success(`Order moved to ${targetColumnId}`);
    } catch {
      toast.error("Failed to update order status");
    }
  }, [orders, updateStatus]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex h-full gap-6 overflow-x-auto pb-4"
        role="region"
        aria-label="Kanban Board"
      >
        {columns.map(column => {
          const columnOrderIds = column.items.map(o => o._id);
          const isAllSelected = columnOrderIds.length > 0 && columnOrderIds.every(id => selectedIds.has(id));
          const hasSelected   = columnOrderIds.some(id => selectedIds.has(id));
          const totalValue    = column.items.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

          return (
            <SortableContext
              key={column.id}
              id={column.id}
              items={columnOrderIds}
              strategy={verticalListSortingStrategy}
            >
              <section
                className="flex flex-col w-[320px] shrink-0"
                aria-labelledby={`kanban-col-${column.id}`}
              >
                {/* Column Header */}
                <div className="group relative flex items-center justify-between mb-4 px-2 py-1">
                  <div className="flex items-center gap-3">
                    <TrackingCheckbox
                      checked={isAllSelected}
                      onCheckedChange={() => onSelectAll(columnOrderIds)}
                      aria-label={`${isAllSelected ? "Deselect" : "Select"} all ${column.title} orders`}
                      className={isAllSelected || hasSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}
                    />
                    <div className="flex items-center gap-2">
                      <h3
                        id={`kanban-col-${column.id}`}
                        className="text-[15px] font-semibold text-[#3A3A3A] lowercase"
                      >
                        {column.title}
                      </h3>
                      <span
                        className="inline-flex items-center justify-center bg-[#ECECEC] text-[#AAAAAA] text-[12px] font-medium h-6 min-w-[24px] px-1.5 rounded-full"
                        aria-label={`${column.items.length} orders`}
                      >
                        {column.items.length}
                      </span>
                    </div>
                  </div>

                  {/* Column total on hover */}
                  <div
                    className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-tracking-elevated px-3 py-1.5 rounded-md text-[13px] font-medium text-[#3A3A3A] pointer-events-none z-10 whitespace-nowrap -top-10"
                    aria-hidden="true"
                  >
                    {totalValue.toLocaleString()} DZD
                  </div>
                </div>

                {/* Drop zone + cards */}
                <div
                  id={column.id}  // DnD uses this as the over.id when dropping onto column
                  className="flex flex-col gap-4 overflow-y-auto h-full px-1 pb-12 rounded-xl"
                  role="list"
                  aria-label={`${column.title} column`}
                >
                  {column.items.map(order => (
                    <SortableOrderCard
                      key={order._id}
                      order={order}
                      selected={selectedIds.has(order._id)}
                      onSelectChange={() => onToggleSelect(order._id)}
                      onCardClick={() => onOrderClick(order._id)}
                    />
                  ))}

                  {column.items.length === 0 && (
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#ECECEC] rounded-tracking-card min-h-[120px]">
                      <p className="text-[14px] text-[#AAAAAA]">Drop here</p>
                    </div>
                  )}
                </div>
              </section>
            </SortableContext>
          );
        })}
      </div>

      {/* Drag overlay: shows ghost card while dragging */}
      <DragOverlay>
        {activeOrder ? (
          <div className="opacity-95 rotate-2 scale-105 pointer-events-none">
            <TrackingOrderCard
              orderNumber={activeOrder.orderNumber}
              customerName={activeOrder.customerName}
              totalPrice={activeOrder.totalAmount ?? 0}
              status={activeOrder._normalizedStatus ?? activeOrder.status ?? "new"}
              date={formatDistanceToNow(activeOrder._creationTime, { addSuffix: true })}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
