"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/products/product-card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const products = useQuery(api.products.list, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  if (products === undefined) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
            <SelectItem value="Shoes">Shoes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No products available
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
