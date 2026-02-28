"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/public/products/product-card";
import { ProductCardSkeleton } from "@/components/public/products/product-card-skeleton";
import { useEffect } from "react";

export default function HomePage() {
  const products = useQuery(api.products.list, { status: "Active" });
  const siteContent = useQuery(api.siteContent.get);
  const incrementHomeViews = useMutation(api.siteContent.incrementHomeViews);

  useEffect(() => {
    incrementHomeViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroTitle    = siteContent?.heroTitle    ?? "Welcome to Gayla Shop";
  const heroSubtitle = siteContent?.heroSubtitle ?? "Discover our collection of quality products";
  const heroCtaText  = siteContent?.heroCtaText  ?? "Shop Now";
  const heroBg       = siteContent?.heroBackgroundImage?.url;

  return (
    <div className="min-h-screen">
      {/* Hero — full viewport height */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex items-center text-white overflow-hidden"
        style={{
          background: heroBg
            ? `url('${heroBg}') center/cover no-repeat`
            : "var(--gradient-button)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="page-container relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="headline-h1 mb-5 text-white">{heroTitle}</h1>
            <p className="body-text mb-10 text-white/85 max-w-lg">{heroSubtitle}</p>
            <a
              href="#products"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-transform active:scale-95 body-text"
              style={{
                background: "var(--gradient-button)",
                boxShadow: "var(--shadow-bluebutton)",
                color: "white",
              }}
            >
              {heroCtaText}
            </a>
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="products" className="py-16">
        <div className="page-container">
          <h2 className="headline-h2 mb-2 text-system-400">Our Products</h2>
          <p className="caption-text text-system-300 mb-8">Handpicked streetwear for every style</p>

          {products === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-system-300">
              <p className="body-text">No products available at the moment</p>
              <p className="caption-text">Check back soon — new arrivals dropping weekly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <div
                  key={product._id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
