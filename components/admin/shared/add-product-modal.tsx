"use client";

/**
 * AddProductModal - Search and add products to an order
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Minus, Package } from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  productId: Id<"products">;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  variants?: Record<string, string>;
  lineTotal: number;
  thumbnail?: string;
}

interface Product {
  _id: Id<"products">;
  title: string;
  slug: string;
  price: number;
  status: "Active" | "Draft" | "Out of stock";
  images?: { url: string; storageId: string }[];
  variantGroups?: {
    name: string;
    values: { label: string; enabled: boolean; order: number }[];
  }[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: LineItem) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const products = useQuery(api.products.list, {});

  // ─── Filtered Products ──────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products.filter((p) => p.status === "Active");
    return products.filter(
      (p) =>
        p.status === "Active" &&
        (p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const selectedProduct = products?.find((p) => p._id === selectedProductId);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    // Validate variants
    if (selectedProduct.variantGroups) {
      for (const group of selectedProduct.variantGroups) {
        if (!selectedVariants[group.name]) {
          toast.error(`Please select ${group.name}`);
          return;
        }
      }
    }

    const lineItem: LineItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.title,
      productSlug: selectedProduct.slug,
      quantity,
      unitPrice: selectedProduct.price,
      variants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
      lineTotal: selectedProduct.price * quantity,
      thumbnail: selectedProduct.images?.[0]?.url,
    };

    onAdd(lineItem);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedProductId(null);
    setQuantity(1);
    setSelectedVariants({});
    onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Product to Order</DialogTitle>
          <DialogDescription>
            Search and select a product to add to this order
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>

          {/* Product Selection */}
          {!selectedProduct ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    {searchQuery ? "No products found" : "No active products available"}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => setSelectedProductId(product._id)}
                    className="w-full text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 transition-colors flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    {product.images?.[0] && (
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.price.toLocaleString()} DA
                      </p>
                    </div>

                    <Badge variant="outline">{product.status}</Badge>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Product Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-100">
                <div className="flex items-start gap-3 mb-4">
                  {selectedProduct.images?.[0] && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-indigo-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedProduct.images[0].url}
                        alt={selectedProduct.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {selectedProduct.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedProduct.price.toLocaleString()} DA
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProductId(null)}
                  >
                    Change
                  </Button>
                </div>

                {/* Variant Selection */}
                {selectedProduct.variantGroups &&
                  selectedProduct.variantGroups.length > 0 && (
                    <div className="space-y-3 border-t border-indigo-200 pt-3">
                      {selectedProduct.variantGroups.map((group) => {
                        const enabledValues = group.values.filter((v) => v.enabled);
                        if (enabledValues.length === 0) return null;

                        return (
                          <div key={group.name}>
                            <Label className="text-xs text-gray-700 mb-1.5">
                              {group.name}
                            </Label>
                            <Select
                              value={selectedVariants[group.name] || ""}
                              onValueChange={(value) =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [group.name]: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${group.name}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {enabledValues
                                  .sort((a, b) => a.order - b.order)
                                  .map((value) => (
                                    <SelectItem key={value.label} value={value.label}>
                                      {value.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-sm mb-2">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Line Total</span>
                  <span className="font-bold text-gray-900">
                    {(selectedProduct.price * quantity).toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedProduct}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
