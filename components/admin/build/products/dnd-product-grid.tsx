"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Eye, EyeOff, Pencil, Trash2,
  ImageIcon, Package, Plus, GripVertical, Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DeleteProductDialog } from "@/components/admin/shared/delete-product-dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  _id:        Id<"products">;
  title:      string;
  slug:       string;
  price:      number;
  category?:  string;
  images?:    { url: string; storageId: string }[];
  status:     "Active" | "Draft" | "Out of stock";
  viewCount?: number;
  sortOrder?: number;
}

interface DndProductGridProps {
  products:          Product[];
  onEdit:            (productId: Id<"products">) => void;
  onDelete:          (productId: Id<"products">) => void;
  onAdd:             () => void;
  /** True while createEmpty mutation is in-flight — shows spinner on the + card */
  isAddingProduct?:  boolean;
}

// ─── SortableCard ────────────────────────────────────────────────────────────────────

function SortableCard({
  product,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
}: {
  product:         Product;
  onEdit:          (id: Id<"products">) => void;
  onDeleteRequest: (product: Product) => void;
  onToggleStatus:  (id: Id<"products">) => void;
}) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: product._id });

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition,
    zIndex:     isDragging ? 50 : undefined,
    opacity:    isDragging ? 0.55 : 1,
  };

  const firstImage = product.images?.[0]?.url;
  const isActive   = product.status === "Active";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border rounded-xl overflow-hidden bg-card",
        "transition-shadow duration-200",
        isDragging
          ? "shadow-2xl ring-2 ring-brand-200 border-brand-200"
          : "border-border hover:shadow-md",
      )}
    >
      {/* ── Image area */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {firstImage ? (
          <Image src={firstImage} alt={product.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Status badge */}
        <Badge
          className={cn(
            "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 border-0",
            isActive                      && "bg-success text-white",
            product.status === "Draft"    && "bg-muted-foreground text-white",
            product.status === "Out of stock" && "bg-warning text-white",
          )}
        >
          {product.status}
        </Badge>

        {/* View count */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <Eye className="h-2.5 w-2.5 text-gray-300" />
          <span className="text-[10px] text-gray-300">{product.viewCount ?? 0}</span>
        </div>

        {/* Hover action overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/50 flex items-center justify-center gap-3",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
        )}>
          {/* Eye — toggles Active ↔ Draft */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleStatus(product._id); }}
            className={cn(
              "p-2.5 rounded-full text-white transition-colors",
              isActive ? "bg-success/80 hover:bg-success" : "bg-muted-foreground/80 hover:bg-muted-foreground",
            )}
            title={isActive ? "Set to Draft" : "Set to Active"}
          >
            {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Edit — opens ProductDrawer */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(product._id); }}
            className="p-2.5 rounded-full bg-brand-200/80 hover:bg-brand-300 text-white transition-colors"
            title="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteRequest(product); }}
            className="p-2.5 rounded-full bg-destructive/80 hover:bg-destructive text-white transition-colors"
            title="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Drag handle — centre-top, revealed on hover */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute top-2 left-1/2 -translate-x-1/2",
            "p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white",
            "cursor-grab active:cursor-grabbing select-none",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          )}
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* ── Info footer */}
      <div className="px-3 py-2.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-foreground mb-0.5">
          {product.title}
        </h3>
        <p className="text-sm font-bold text-brand-200">
          {product.price.toLocaleString()}
          <span className="text-[10px] font-semibold text-brand-100 ml-0.5">DZD</span>
        </p>
        {product.category && (
          <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
            {product.category}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── AddCard ──────────────────────────────────────────────────────────────────────

function AddCard({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative border-2 border-dashed border-border rounded-xl",
        "aspect-square flex flex-col items-center justify-center",
        "text-muted-foreground transition-all duration-200 select-none",
        "hover:border-brand-200 hover:bg-brand-50 hover:text-brand-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-7 w-7 animate-spin text-brand-200 mb-1" />
          <span className="text-[11px] font-medium text-brand-200">Creating…</span>
        </>
      ) : (
        <>
          <Plus className="h-7 w-7 mb-1" />
          <span className="text-[11px] font-semibold">Add Product</span>
        </>
      )}
    </button>
  );
}

// ─── DndProductGrid ─────────────────────────────────────────────────────────────

export function DndProductGrid({
  products,
  onEdit,
  onDelete,
  onAdd,
  isAddingProduct = false,
}: DndProductGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Local order for smooth optimistic drag — cleared once reorder() resolves
  const [localOrder, setLocalOrder] = useState<Product[]>([]);
  const displayed = localOrder.length > 0 ? localOrder : products;

  const reorder      = useMutation(api.products.reorder);
  const toggleStatus = useMutation(api.products.toggleStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Drag end — reorder optimistically, then persist to Convex
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = displayed.findIndex((p) => p._id === active.id);
    const newIdx = displayed.findIndex((p) => p._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(displayed, oldIdx, newIdx);
    setLocalOrder(reordered); // optimistic UI update

    try {
      await reorder({
        items: reordered.map((p, i) => ({ id: p._id, sortOrder: i })),
      });
      // Mutation committed — Convex live query will now match; clear optimistic state
      setLocalOrder([]);
    } catch (err: any) {
      toast.error("Could not save new order — " + (err.message ?? "unknown error"));
      setLocalOrder([]); // revert to Convex data
    }
  };

  // ── Eye icon — instant Active ↔ Draft flip
  const handleToggleStatus = async (id: Id<"products">) => {
    try {
      const { status } = await toggleStatus({ id });
      toast.success(`Set to ${status}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to toggle status");
    }
  };

  // ── Empty state
  if (products.length === 0 && !isAddingProduct) {
    return (
      <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex items-center gap-2 mb-8">
          <Package className="h-6 w-6 text-brand-200" />
          <h2 className="text-2xl font-bold text-foreground">Product Catalog</h2>
        </div>
        <div className="text-center py-12">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 bg-brand-50 rounded-full animate-pulse" />
            <Package className="h-20 w-20 text-brand-100 relative" />
          </div>
          <h3 className="text-foreground font-bold text-xl">Catalog is empty</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Click the card below to create your first product.
          </p>
          <div className="flex justify-center mt-8">
            <div className="w-44">
              <AddCard onClick={onAdd} isLoading={isAddingProduct} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-brand-200" />
          <h2 className="text-2xl font-bold text-foreground">Product Catalog</h2>
          <span className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xs text-muted-foreground italic hidden sm:block">
          Drag to reorder · hover for actions
        </p>
      </div>

      {/* Grid - Changed from xl:grid-cols-5 to xl:grid-cols-3 for better visual balance */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayed.map((p) => p._id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {displayed.map((product) => (
              <SortableCard
                key={product._id}
                product={product}
                onEdit={onEdit}
                onDeleteRequest={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
              />
            ))}

            {/* "+" card — always last; clicking it calls onAdd which runs createEmpty */}
            <AddCard onClick={onAdd} isLoading={isAddingProduct} />
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete confirmation */}
      <DeleteProductDialog
        product={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={(id) => { setDeleteTarget(null); onDelete(id); }}
      />
    </div>
  );
}
