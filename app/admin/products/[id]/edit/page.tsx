"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Plus, X, Save } from "lucide-react";
import Image from "next/image";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as Id<"products">;

  const product = useQuery(api.products.getById, { id: productId });
  const updateProduct = useMutation(api.products.update);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: "",
    status: "Active" as "Active" | "Draft" | "Out of stock",
    images: [] as { url: string; storageId: string }[],
    variants: [] as { size?: string; color?: string }[],
  });

  const [imageUrl, setImageUrl] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [variantColor, setVariantColor] = useState("");

  // Load product data when it's available
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description || "",
        price: product.price,
        category: product.category,
        status: product.status,
        images: product.images,
        variants: product.variants || [],
      });
    }
  }, [product]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleAddImage = () => {
    if (!imageUrl) return;
    setFormData({
      ...formData,
      images: [...formData.images, { url: imageUrl, storageId: `img-${Date.now()}` }],
    });
    setImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleAddVariant = () => {
    if (!variantSize && !variantColor) return;
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: variantSize || undefined, color: variantColor || undefined }],
    });
    setVariantSize("");
    setVariantColor("");
  };

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.title || !formData.slug || !formData.category || formData.price <= 0) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (formData.images.length === 0) {
        alert("Please add at least one image");
        setIsSubmitting(false);
        return;
      }

      await updateProduct({
        id: productId,
        title: formData.title,
        slug: formData.slug,
        description: formData.description || undefined,
        price: formData.price,
        category: formData.category,
        images: formData.images,
        variants: formData.variants.length > 0 ? formData.variants : undefined,
        status: formData.status,
      });

      alert("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Classic Cotton T-Shirt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="classic-cotton-tshirt"
                required
              />
              <p className="text-xs text-muted-foreground">
                Product URL: /products/{formData.slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (DZD) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="2500"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Shoes">Shoes</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active (Visible to customers)</SelectItem>
                  <SelectItem value="Draft">Draft (Hidden)</SelectItem>
                  <SelectItem value="Out of stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images ({formData.images.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL (e.g., from Unsplash)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button type="button" onClick={handleAddImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                    <Image src={image.url} alt={`Product ${index + 1}`} fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        Main Image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              First image will be used as the main product thumbnail.
            </p>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Variants ({formData.variants.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Size (e.g., S, M, L)"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
              />
              <Input
                placeholder="Color (e.g., Red, Blue)"
                value={variantColor}
                onChange={(e) => setVariantColor(e.target.value)}
              />
              <Button type="button" onClick={handleAddVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {formData.variants.length > 0 && (
              <div className="space-y-2">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-3 rounded-md"
                  >
                    <div className="flex gap-4">
                      {variant.size && (
                        <span className="text-sm">
                          <strong>Size:</strong> {variant.size}
                        </span>
                      )}
                      {variant.color && (
                        <span className="text-sm">
                          <strong>Color:</strong> {variant.color}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Add different size and color combinations for this product.
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
