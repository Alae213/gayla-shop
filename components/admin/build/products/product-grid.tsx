"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ImageIcon, Package, Plus, Lightbulb } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { DeleteProductDialog } from "@/components/admin/shared/delete-product-dialog";

interface Product {
  _id: Id<"products">;
  title: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  images?: { url: string; storageId: string }[];
  status: "Active" | "Draft" | "Out of stock";
  viewCount: number;
}

interface ProductGridProps {
  products: Product[];
  onEdit:   (productId: Id<"products">) => void;
  onDelete: (productId: Id<"products">) => void;
  onAdd:    () => void;
  /** M2 Task 2.2 — when set, grid is already pre-filtered to show only imageless products */
  noImageFilterActive?: boolean;
  /** M2 Task 2.2 — clear the no-image filter */
  onClearFilter?: () => void;
}

// ─── Tip pill ─────────────────────────────────────────────────────────────
function TipPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full">
      <Lightbulb className="h-3 w-3 shrink-0" />
      {children}
    </div>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onAdd,
  noImageFilterActive,
  onClearFilter,
}: ProductGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDeleteConfirm = (productId: Id<"products">) => {
    setDeleteTarget(null);
    onDelete(productId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            Product Catalog
          </h2>
          {/* M2 Task 2.2 — active filter badge */}
          {noImageFilterActive && (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors"
            >
              No image filter
              <span className="ml-1 font-bold">×</span>
            </button>
          )}
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <Badge
                  variant={product.status === "Active" ? "default" : "secondary"}
                  className="absolute top-3 right-3"
                >
                  {product.status}
                </Badge>
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3 text-gray-300" />
                  <span className="text-xs text-gray-300">{product.viewCount}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-2">
                  {product.price.toLocaleString()} DZD
                </p>
                {product.category && (
                  <Badge variant="outline" className="mb-4 text-xs">{product.category}</Badge>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(product._id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── M2 Task 2.3: Rich empty state ─────────────────────────────── */
        noImageFilterActive ? (
          // Empty state when filter is active but no results
          <div className="text-center py-16">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">All products have images</p>
            <p className="text-gray-400 text-sm mt-1">Every product in your catalog has at least one image.</p>
            <Button variant="outline" onClick={onClearFilter} className="mt-4">
              Show all products
            </Button>
          </div>
        ) : (
          // True empty state — no products at all
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse" />
              <Package className="h-24 w-24 text-indigo-300 relative" />
            </div>
            <h3 className="text-gray-800 font-bold text-xl">Your catalog is empty</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
              Add your first product to start selling on Gayla.
            </p>
            <Button onClick={onAdd} size="lg" className="mt-6 gap-2">
              <Plus className="h-5 w-5" />
              Add Product
            </Button>
            {/* Tip pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
              <TipPill>Add product images</TipPill>
              <TipPill>Set a price in DZD</TipPill>
              <TipPill>Set status to Active</TipPill>
            </div>
          </div>
        )
      )}

      {/* Delete confirmation dialog */}
      <DeleteProductDialog
        product={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
