"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { OrderForm } from "@/components/products/order-form";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useQuery(api.products.getBySlug, { slug });
  const incrementViewCount = useMutation(api.products.incrementViewCount);

  // Increment view count when product loads
  useEffect(() => {
    if (product && product._id) {
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

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
            {product.images[selectedImageIndex] ? (
              <Image
                src={product.images[selectedImageIndex].url}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
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
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
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
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
}
