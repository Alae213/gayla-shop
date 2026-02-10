"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/products/product-card";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const products = useQuery(api.products.list, {});

  if (products === undefined) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to Gayla Shop
            </h1>
            <p className="text-xl mb-8">
              Discover our collection of quality products
            </p>
            <a
              href="#products"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Products
            </a>
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="products" className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Our Products</h2>
          
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No products available at the moment
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
