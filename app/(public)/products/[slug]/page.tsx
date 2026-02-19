"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound, useParams } from "next/navigation";
import { OrderForm } from "@/components/products/order-form";
import { formatPrice } from "@/lib/utils";
import { Loader2, ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useQuery(api.products.getBySlug, { slug });
  const incrementViewCount = useMutation(api.products.incrementViewCount);

  // Guard so we only call incrementViewCount once per page mount,
  // even if the effect re-fires during HMR or React Strict Mode.
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (product?._id && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementViewCount({ id: product._id });
    }
  }, [product?._id, incrementViewCount]);

  if (product === undefined) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (product === null) {
    notFound();
  }

  const currentImage = product.images?.[selectedImageIndex]?.url;

  return (
    <div className="container py-12">
      <nav className="mb-6 text-sm text-muted-foreground flex gap-2">
        <a href="/" className="hover:text-foreground">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-foreground">Products</a>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted flex items-center justify-center group">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-16 w-16 opacity-30" />
                <span className="text-sm">No Image</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.storageId}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                  aria-label={`View ${product.title} image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Order Form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price, "en-US")}
            </p>
          </div>

          {product.description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
}
