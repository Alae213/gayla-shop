"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ImageIcon, Package, Plus } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { DeleteProductDialog } from "./delete-product-dialog";

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
}

export function ProductGrid({ products, onEdit, onDelete, onAdd }: ProductGridProps) {
  // M1 Task 1.1 — local state drives the AlertDialog; no confirm() anywhere
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDeleteConfirm = (productId: Id<"products">) => {
    setDeleteTarget(null);
    onDelete(productId); // parent handles mutation + undo toast
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-indigo-600" />
          Product Catalog
        </h2>
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
                  <Badge variant="outline" className="mb-4 text-xs">
                    {product.category}
                  </Badge>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(product._id)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {/* M1: opens AlertDialog instead of confirm() */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No products yet</p>
          <Button onClick={onAdd} className="mt-4">
            Create Your First Product
          </Button>
        </div>
      )}

      {/* M1 Task 1.1 — styled delete confirmation dialog */}
      <DeleteProductDialog
        product={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
