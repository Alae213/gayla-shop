"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allProducts = useQuery(api.products.list, { status: "Active" });

  const categories = useMemo(() => {
    if (!allProducts) return [];
    const unique = Array.from(
      new Set(allProducts.map((p) => p.category).filter(Boolean))
    ) as string[];
    return unique.sort();
  }, [allProducts]);

  const filtered = useMemo(() => {
    if (!allProducts) return undefined;
    if (selectedCategory === "all") return allProducts;
    return allProducts.filter((p) => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  return (
    <div className="page-container py-12">
      {/* Page header */}
      <div className="mb-10">
        <nav className="mb-3 flex gap-2 caption-text text-muted-foreground">
          <a href="/" className="hover:text-foreground">Home</a>
          <span>/</span>
          <span className="text-foreground">Shop</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="headline-h1 text-foreground">All Products</h1>
            {filtered !== undefined && (
              <p className="caption-text text-muted-foreground mt-1">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
                {selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
              </p>
            )}
          </div>

          {allProducts !== undefined && categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <p className="body-text">No products in this category</p>
          <button
            onClick={() => setSelectedCategory("all")}
            className="caption-text text-brand-200 underline hover:no-underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <div
              key={product._id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
