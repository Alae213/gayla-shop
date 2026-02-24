"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound, useParams } from "next/navigation";
import { ProductActions } from "@/components/product/product-actions";
import { formatPrice } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function ProductDetailSkeleton() {
  return (
    <div className="page-container py-12">
      <div className="h-4 w-48 bg-system-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-system-100 animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[0,1,2,3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-system-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-6 pt-2">
          <div className="space-y-3">
            <div className="h-9 w-3/4 bg-system-200 rounded animate-pulse" />
            <div className="h-7 w-24 bg-system-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[0,1,2].map((i) => (
              <div key={i} className="h-4 bg-system-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-system-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useQuery(api.products.getBySlug, { slug });
  const incrementViewCount = useMutation(api.products.incrementViewCount);
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (product?._id && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementViewCount({ id: product._id });
    }
  }, [product?._id, incrementViewCount]);

  if (product === undefined) return <ProductDetailSkeleton />;
  if (product === null) notFound();

  const currentImage = product.images?.[selectedImageIndex]?.url;

  return (
    <div className="page-container py-10 md:py-14">
      <nav className="mb-8 flex gap-2 caption-text text-system-300">
        <Link href="/" className="hover:text-system-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-system-400 transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-system-400 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-2xl bg-system-100 group">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-system-300">
                <ImageIcon className="h-16 w-16 opacity-20" />
                <span className="caption-text">No Image Available</span>
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.storageId}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-brand-200 scale-105"
                      : "border-system-200 hover:border-system-300"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            {product.category && (
              <Badge variant="secondary" className="caption-text">
                {product.category}
              </Badge>
            )}
            <h1 className="headline-h1 text-system-400 leading-tight">
              {product.title}
            </h1>
            <p className="text-3xl font-extrabold text-brand-200 tracking-tight">
              {formatPrice(product.price, "en-US")}
            </p>
          </div>

          <div className="border-t border-system-200" />

          {product.description && (
            <div
              className="prose prose-sm max-w-none text-system-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
