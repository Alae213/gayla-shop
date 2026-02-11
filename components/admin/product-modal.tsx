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
import { Plus, X } from "lucide-react";
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

export function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: "",
    status: "Active" as "Active" | "Draft" | "Out of stock",
    images: [] as { url: string; storageId: string }[],
  });

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  useEffect(() => {
    if (product) {
      setProductForm({
        title: product.title,
        slug: product.slug,
        description: product.description || "",
        price: product.price,
        category: product.category,
        status: product.status,
        images: product.images || [],
      });
    }
  }, [product]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (productForm.images.length + files.length > 5) {
      toast.error("Maximum 5 images per product");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedImages: { url: string; storageId: string }[] = [];

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error("Upload failed");

        const { storageId } = await result.json();
        const imageUrl = new URL(uploadUrl);
        imageUrl.pathname = `/api/storage/${storageId}`;

        uploadedImages.push({
          storageId,
          url: imageUrl.toString(),
        });
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded!`);
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!productForm.title || !productForm.slug || productForm.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (productForm.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      if (product) {
        // Update existing product
        await updateProduct({
          id: product._id,
          title: productForm.title,
          slug: productForm.slug,
          description: productForm.description,
          price: productForm.price,
          category: productForm.category,
          status: productForm.status,
          images: productForm.images,
        });
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        await createProduct({
          title: productForm.title,
          slug: productForm.slug,
          description: productForm.description,
          price: productForm.price,
          category: productForm.category,
          status: productForm.status,
          images: productForm.images,
        });
        toast.success("Product created successfully!");
      }

      onSuccess();
      onClose();
      setProductForm({
        title: "",
        slug: "",
        description: "",
        price: 0,
        category: "",
        status: "Active",
        images: [],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            Fill in the product details below. Title, slug, price, and at least one image are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Images */}
          <div>
            <Label>Product Images (Max 5)</Label>
            <div className="mt-2 grid grid-cols-5 gap-4">
              {productForm.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeProductImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {productForm.images.length < 5 && (
                <div>
                  <input
                    ref={productFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-square"
                    onClick={() => productFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-indigo-600"></div>
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              )}
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
                  slug: generateSlug(title),
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
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version of the title
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
              value={productForm.price}
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
            <Label htmlFor="status">Status</Label>
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
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {product ? "Update Product" : "Create Product"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
