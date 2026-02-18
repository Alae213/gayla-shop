"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/products/product-card";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const products = useQuery(api.products.list, { status: "Active" });
  const siteContent = useQuery(api.siteContent.get);
  const incrementHomeViews = useMutation(api.siteContent.incrementHomeViews);

  useEffect(() => {
    incrementHomeViews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroTitle = siteContent?.heroTitle || "Welcome to Gayla Shop";
  const heroSubtitle = siteContent?.heroSubtitle || "Discover our collection of quality products";
  const heroCtaText = siteContent?.heroCtaText || "Shop Now";
  const heroBg = siteContent?.heroBackgroundImage?.url;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[500px] flex items-center text-white overflow-hidden"
        style={{
          background: heroBg
            ? `url('${heroBg}') center/cover no-repeat`
            : "linear-gradient(135deg, #1e3a5f 0%, #2e73db 100%)",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            {siteContent === undefined ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <h1 className="text-5xl font-bold mb-4 leading-tight">{heroTitle}</h1>
                <p className="text-xl mb-8 text-white/90">{heroSubtitle}</p>
                <a
                  href="#products"
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {heroCtaText}
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="products" className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Our Products</h2>
          {products === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
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
