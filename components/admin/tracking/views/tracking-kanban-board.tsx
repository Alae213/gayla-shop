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
import { Ban } from "lucide-react";

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

// hold column is visible so wrong-number orders remain trackable,
// but it is NOT a valid drag target — hold is set only via call log.
const KANBAN_COLUMNS: { id: MVPStatus; title: string; accent?: string }[] = [
  { id: "new",       title: "new" },
  { id: "confirmed", title: "confirmed" },
  { id: "packaged",  title: "packaged" },
  { id: "shipped",   title: "shipped" },
  { id: "hold",      title: "hold", accent: "text-orange-500" },
];

// Columns that can receive a drop. "hold" is intentionally excluded.
const DRAGGABLE_TARGETS = new Set<MVPStatus>(["new", "confirmed", "packaged", "shipped"]);

// Forward-only transition map. Each status lists the statuses it may move TO via drag.
// Backward moves are rejected to prevent accidental data corruption.
const ALLOWED_TRANSITIONS: Record<MVPStatus, MVPStatus[]> = {
  new:       ["confirmed"],
  confirmed: ["packaged", "new"],   // allow reverting to new (e.g. customer callback)
  packaged:  ["shipped", "confirmed"],
  shipped:   [],                    // shipped is terminal for drag; use action bar to revert
  hold:      ["new"],               // only Resume as New is allowed (via action bar, not drag)
  canceled:  [],
  blocked:   [],
};

const VALID_COLUMNS = new Set<string>(KANBAN_COLUMNS.map(c => c.id));

function variantLabel(order: Order): string {
  const parts: string[] = [];
  if (order.selectedVariant?.size)  parts.push(order.selectedVariant.size);
  if (order.selectedVariant?.color) parts.push(order.selectedVariant.color);
  return parts.join(" / ");
}

// Draggable card wrapper
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
    data: { type: "card", order, columnId: order._normalizedStatus ?? order.status ?? "new" },
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
        productName={order.productName}
        productVariant={variantLabel(order)}
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

  const resolveTargetColumn = useCallback(
    (event: DragEndEvent): MVPStatus | null => {
      const { over } = event;
      if (!over) return null;

      const overId = over.id as string;
      if (VALID_COLUMNS.has(overId)) return overId as MVPStatus;

      const overData = over.data?.current as { columnId?: MVPStatus } | undefined;
      if (overData?.columnId && VALID_COLUMNS.has(overData.columnId)) {
        return overData.columnId;
      }

      const overOrder = orders.find(o => o._id === overId);
      if (overOrder) return getColumn(overOrder);

      return null;
    },
    [orders]
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active } = event;

    const targetColumnId = resolveTargetColumn(event);
    if (!targetColumnId) return;

    const orderId = active.id as string;
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const currentStatus = getColumn(order);
    if (currentStatus === targetColumnId) return;

    // FIX 17A: Block drag onto the hold column — hold is set only via
    // wrong-number call log, never by manual drag.
    if (!DRAGGABLE_TARGETS.has(targetColumnId)) {
      toast.warning(`"${targetColumnId}" cannot be set by dragging`);
      return;
    }

    // FIX 17A: Enforce the allowed transition map so operators can’t skip
    // stages or make accidental backward jumps (e.g. new → shipped).
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetColumnId)) {
      toast.warning(
        `Cannot move from “${currentStatus}” to “${targetColumnId}” by dragging`,
        { description: "Use the order panel to change this status." }
      );
      return;
    }

    try {
      await updateStatus({ id: orderId as Id<"orders">, status: targetColumnId });
      toast.success(`Order moved to ${targetColumnId}`);
    } catch {
      toast.error("Failed to update order status");
    }
  }, [orders, updateStatus, resolveTargetColumn]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        <div
          className="flex flex-1 gap-6 overflow-x-auto pb-4"
          role="region"
          aria-label="Kanban Board"
        >
          {columns.map(column => {
            const columnOrderIds = column.items.map(o => o._id);
            const isAllSelected = columnOrderIds.length > 0 && columnOrderIds.every(id => selectedIds.has(id));
            const hasSelected   = columnOrderIds.some(id => selectedIds.has(id));
            const totalValue    = column.items.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

            // Hide the hold column entirely when empty
            if (column.id === "hold" && column.items.length === 0) return null;

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
                        aria-label={`${
                          isAllSelected ? "Deselect" : "Select"
                        } all ${column.title} orders`}
                        className={
                          isAllSelected || hasSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        }
                      />
                      <div className="flex items-center gap-2">
                        <h3
                          id={`kanban-col-${column.id}`}
                          className={`text-[15px] font-semibold lowercase ${
                            column.accent ?? "text-[#3A3A3A]"
                          }`}
                        >
                          {column.title}
                        </h3>
                        <span
                          className={`inline-flex items-center justify-center text-[12px] font-medium h-6 min-w-[24px] px-1.5 rounded-full ${
                            column.id === "hold"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-[#ECECEC] text-[#AAAAAA]"
                          }`}
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
                    id={column.id}
                    className={`flex flex-col gap-4 overflow-y-auto h-full px-1 pb-12 rounded-xl ${
                      column.id === "hold" ? "bg-orange-50/40" : ""
                    }`}
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

        {/* FIX 17B: Surface blacklistCount as a board footer note so the
            operator always knows how many orders are in the blacklist tab. */}
        {blacklistCount > 0 && (
          <div className="flex items-center gap-2 px-2 py-2 text-[12px] text-rose-500 select-none">
            <Ban className="w-3.5 h-3.5 shrink-0" />
            <span>
              {blacklistCount} order{blacklistCount !== 1 ? "s" : ""} in Blacklist
            </span>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeOrder ? (
          <div className="opacity-95 rotate-2 scale-105 pointer-events-none">
            <TrackingOrderCard
              orderNumber={activeOrder.orderNumber}
              customerName={activeOrder.customerName}
              productName={activeOrder.productName}
              productVariant={variantLabel(activeOrder)}
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
