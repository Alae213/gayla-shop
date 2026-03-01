"use client";

import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

interface Product {
  _id: Id<"products">;
  title: string;
  price: number;
  images?: { url: string; storageId: string }[];
}

interface DeleteProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (productId: Id<"products">) => void;
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  if (!product) return null;

  const thumbnail = product.images?.[0]?.url;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="h-5 w-5" />
            Delete product?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Product preview card */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 border border-gray-200 mt-2">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {product.title}
                  </p>
                  <p className="text-indigo-600 font-bold text-sm mt-0.5">
                    {product.price.toLocaleString()} DZD
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This product will be removed from your catalog.
                You can <span className="font-medium text-gray-800">undo this</span> within
                5 seconds using the notification that appears.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(product._id)}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            Delete product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
