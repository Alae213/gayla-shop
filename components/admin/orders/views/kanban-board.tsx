"use client";

import React, { useState, useCallback } from "react";
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
import { OrderCard } from "../components/order-card";
import { Checkbox } from "../components/checkbox";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Ban } from "lucide-react";

export type Order = any;

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface KanbanBoardProps {
  orders: Order[];
  selectedIds: Set<Id<"orders">>;
  onToggleSelect: (id: Id<"orders">) => void;
  onSelectAll: (ids: Id<"orders">[]) => void;
  onOrderClick: (id: Id<"orders">) => void;
  blacklistCount?: number;
}

const KANBAN_COLUMNS: { id: MVPStatus; title: string; accent?: string }[] = [
  { id: "new",       title: "new" },
  { id: "confirmed", title: "confirmed" },
  { id: "packaged",  title: "packaged" },
  { id: "shipped",   title: "shipped" },
  { id: "hold",      title: "hold", accent: "text-warning" },
];

const DRAGGABLE_TARGETS = new Set<MVPStatus>(["new", "confirmed", "packaged", "shipped"]);

const ALLOWED_TRANSITIONS: Record<MVPStatus, MVPStatus[]> = {
  new:       ["confirmed"],
  confirmed: ["packaged", "new"],
  packaged:  ["shipped", "confirmed"],
  shipped:   [],
  hold:      ["new"],
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

function extractCardData(order: Order, columnId: MVPStatus) {
  if (order.lineItems && order.lineItems.length > 0) {
    const firstItem = order.lineItems[0];
    const variants = firstItem.variants ?? {};
    const variantValues = Object.values(variants) as string[];
    const variantLabel = variantValues[0] ?? undefined;
    const variantColor = variants.color ?? undefined;
    
    return {
      productName: firstItem.productName,
      thumbnail: firstItem.thumbnail,
      quantity: firstItem.quantity,
      variantLabel,
      variantColor,
      moreItemsCount: order.lineItems.length - 1,
      productVariant: undefined,
    };
  }
  
  return {
    productName: order.productName,
    thumbnail: undefined,
    quantity: order.quantity > 1 ? order.quantity : undefined,
    variantLabel: undefined,
    variantColor: undefined,
    moreItemsCount: 0,
    productVariant: variantLabel(order) || undefined,
  };
}

function SortableOrderCard({
  order,
  columnId,
  selected,
  onSelectChange,
  onCardClick,
}: {
  order: Order;
  columnId: MVPStatus;
  selected: boolean;
  onSelectChange: () => void;
  onCardClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order._id,
    data: { type: "card", order, columnId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const cardData = extractCardData(order, columnId);
  const status = order._normalizedStatus ?? order.status ?? "new";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        productName={cardData.productName}
        productVariant={cardData.productVariant}
        thumbnail={cardData.thumbnail}
        wilaya={order.customerWilaya}
        deliveryType={order.deliveryType}
        quantity={cardData.quantity}
        variantLabel={cardData.variantLabel}
        variantColor={cardData.variantColor}
        moreItemsCount={cardData.moreItemsCount}
        callLog={order.callLog}
        showCallLog={columnId === "new"}
        totalPrice={order.totalAmount ?? 0}
        status={status}
        date={formatDistanceToNow(order._creationTime, { addSuffix: true })}
        selected={selected}
        onSelectChange={onSelectChange}
        onCardClick={onCardClick}
      />
    </div>
  );
}

export function KanbanBoard({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOrderClick,
  blacklistCount = 0,
}: KanbanBoardProps) {
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

    if (!DRAGGABLE_TARGETS.has(targetColumnId)) {
      toast.warning(`"${targetColumnId}" cannot be set by dragging`);
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetColumnId)) {
      toast.warning(
        `Cannot move from "${currentStatus}" to "${targetColumnId}" by dragging`,
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
                  <div className="group relative flex items-center justify-between mb-4 px-2 py-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
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
                            column.accent ?? "text-foreground"
                          }`}
                        >
                          {column.title}
                        </h3>
                        <span
                          className={`inline-flex items-center justify-center text-xs font-medium h-6 min-w-[24px] px-1.5 rounded-full ${
                            column.id === "hold"
                              ? "bg-warning/10 text-warning-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                          aria-label={`${column.items.length} orders`}
                        >
                          {column.items.length}
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-md px-3 py-1.5 rounded-md text-sm font-medium text-foreground pointer-events-none z-10 whitespace-nowrap -top-10"
                      aria-hidden="true"
                    >
                      {totalValue.toLocaleString()} DZD
                    </div>
                  </div>

                  <div
                    id={column.id}
                    className={`flex flex-col gap-4 overflow-y-auto h-full px-1 pb-12 rounded-xl ${
                      column.id === "hold" ? "bg-warning/10" : ""
                    }`}
                    role="list"
                    aria-label={`${column.title} column`}
                  >
                    {column.items.map(order => (
                      <SortableOrderCard
                        key={order._id}
                        order={order}
                        columnId={column.id}
                        selected={selectedIds.has(order._id)}
                        onSelectChange={() => onToggleSelect(order._id)}
                        onCardClick={() => onOrderClick(order._id)}
                      />
                    ))}

                    {column.items.length === 0 && (
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[120px]">
                        <p className="text-sm text-muted-foreground">Drop here</p>
                      </div>
                    )}
                  </div>
                </section>
              </SortableContext>
            );
          })}
        </div>

        {blacklistCount > 0 && (
          <div className="flex items-center gap-2 px-2 py-2 text-xs text-destructive select-none">
            <Ban className="w-3.5 h-3.5 shrink-0" />
            <span>
              {blacklistCount} order{blacklistCount !== 1 ? "s" : ""} in Blacklist
            </span>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <div className="opacity-95 rotate-2 scale-105 pointer-events-none">
            <OrderCard
              orderNumber={activeOrder.orderNumber}
              customerName={activeOrder.customerName}
              productName={activeOrder.productName ?? activeOrder.lineItems?.[0]?.productName}
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
