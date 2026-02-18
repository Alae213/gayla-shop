"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
  _id: Id<"products">;
  title: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  images?: { url: string; storageId: string }[];
  status: "Active" | "Draft" | "Out of stock";
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  status: "Active" as "Active" | "Draft" | "Out of stock",
  images: [] as { url: string; storageId: string }[],
};

export function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_FORM);

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  // Reset or populate form whenever modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Edit mode — populate with existing product data
        setProductForm({
          title: product.title,
          slug: product.slug,
          description: product.description || "",
          price: product.price,
          category: product.category,
          status: product.status,
          images: product.images || [],
        });
      } else {
        // Add mode — always start with clean empty form
        setProductForm(EMPTY_FORM);
      }
    }
  }, [isOpen, product]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (productForm.images.length + files.length > 5) {
      toast.error("Maximum 5 images per product");
      return;
    }

    setIsUploadingImage(true);
    const uploadedImages: { url: string; storageId: string }[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Step 1: Get presigned upload URL
        const uploadUrl = await generateUploadUrl();

        // Step 2: Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error(`Upload failed for ${file.name}`);

        // Step 3: Get storageId from Convex response
        const { storageId } = await result.json();

        // Step 4: Build the correct Convex serving URL (origin only, no query params)
        const convexUrl = new URL(uploadUrl);
        const imageUrl = `${convexUrl.origin}/api/storage/${storageId}`;

        uploadedImages.push({ storageId, url: imageUrl });
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      if (uploadedImages.length > 0) {
        toast.success(
          uploadedImages.length === 1
            ? "Image uploaded!"
            : `${uploadedImages.length} images uploaded!`
        );
      }
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
      // Reset so the same file can be re-selected if needed
      if (productFileInputRef.current) productFileInputRef.current.value = "";
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!productForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!productForm.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (productForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (productForm.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSaving(true);
    try {
      if (product) {
        await updateProduct({
          id: product._id,
          title: productForm.title,
          slug: productForm.slug,
          description: productForm.description || undefined,
          price: productForm.price,
          category: productForm.category,
          status: productForm.status,
          images: productForm.images,
        });
        toast.success("Product updated!");
      } else {
        await createProduct({
          title: productForm.title,
          slug: productForm.slug,
          description: productForm.description || undefined,
          price: productForm.price,
          category: productForm.category,
          status: productForm.status,
          images: productForm.images,
        });
        toast.success("Product created!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details below."
              : "Fill in the product details. Title, slug, price, and at least one image are required."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Images */}
          <div>
            <Label>
              Product Images{" "}
              <span className="text-gray-400 text-xs font-normal">
                ({productForm.images.length}/5)
              </span>
            </Label>
            <div className="mt-2 grid grid-cols-5 gap-3">
              {productForm.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeProductImage(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {productForm.images.length < 5 && (
                <div
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  onClick={() =>
                    !isUploadingImage && productFileInputRef.current?.click()
                  }
                >
                  <input
                    ref={productFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-indigo-600" />
                  ) : (
                    <div className="text-center">
                      <Plus className="h-5 w-5 text-gray-400 mx-auto" />
                      <span className="text-[10px] text-gray-400 mt-1 block">Add</span>
                    </div>
                  )}
                </div>
              )}

              {/* Empty placeholders to keep grid shape */}
              {Array.from({
                length: Math.max(0, 4 - productForm.images.length),
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square border border-dashed border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center"
                >
                  <ImageIcon className="h-5 w-5 text-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={productForm.title}
              onChange={(e) => {
                const title = e.target.value;
                setProductForm((prev) => ({
                  ...prev,
                  title,
                  // Only auto-generate slug when creating a new product
                  slug: !product ? generateSlug(title) : prev.slug,
                }));
              }}
              placeholder="Classic Cotton T-Shirt"
              className="mt-2"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={productForm.slug}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="classic-cotton-tshirt"
              className="mt-2"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used in the product URL — must be unique
            </p>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">
              Price (DZD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={productForm.price === 0 ? "" : productForm.price}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="2500"
              className="mt-2"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={productForm.category}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="Clothing"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Product description..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={productForm.status}
              onValueChange={(value: "Active" | "Draft" | "Out of stock") =>
                setProductForm((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Out of stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
