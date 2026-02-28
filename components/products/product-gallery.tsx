"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  product: {
    title: string;
    images?: Array<{ url: string; storageId: string }>;
  };
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const currentImage = product.images?.[selectedImageIndex]?.url;

  return (
    <div className="space-y-6">
      {/* Main Image */}
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

      {/* Thumbnail Gallery - Phase 1 T1.4: Replaced raw button with Button primitive */}
      {product.images && product.images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {product.images.map((image, index) => (
            <Button
              variant="ghost"
              key={image.storageId}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "aspect-square relative overflow-hidden rounded-lg border-2 transition-all p-0 h-auto",
                selectedImageIndex === index
                  ? "border-brand-200 scale-105"
                  : "border-system-200 hover:border-system-300"
              )}
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
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
