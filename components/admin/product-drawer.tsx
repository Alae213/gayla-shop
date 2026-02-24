"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  X, Plus, ImageIcon, Loader2, Save,
  Bold, Italic, List,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VariantGroupEditor, VariantGroup } from "./variant-group-editor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id:            Id<"products">;
  title:          string;
  slug:           string;
  description?:   string;
  price:          number;
  category?:      string;
  images?:        { url: string; storageId: string }[];
  status:         "Active" | "Draft" | "Out of stock";
  variantGroups?: VariantGroup[];
}

interface ProductDrawerProps {
  isOpen:     boolean;
  onClose:    () => void;
  product:    Product | null;
  onSuccess?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const isUntitled = (p: Product) =>
  p.title === "Untitled Product" || p.slug.startsWith("untitled-");

// ─── TiptapToolbar ────────────────────────────────────────────────────────────────────

// editor prop typed as Editor | null — useEditor returns null before mount
function TiptapToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn(
      "p-1.5 rounded transition-colors",
      active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100",
    );
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}>
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}>
        <Italic className="h-3.5 w-3.5" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}>
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── ProductDrawer ────────────────────────────────────────────────────────────────────
// Always operates in UPDATE mode.
// New products are created via api.products.createEmpty first (in admin/page.tsx),
// which guarantees a real DB record exists before this drawer opens.

export function ProductDrawer({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductDrawerProps) {
  const [title,            setTitle]            = useState("");
  const [price,            setPrice]            = useState<number>(0);
  const [status,           setStatus]           = useState<"Active" | "Draft" | "Out of stock">("Draft");
  const [images,           setImages]           = useState<{ url: string; storageId: string }[]>([]);
  const [variantGroups,    setVariantGroups]    = useState<VariantGroup[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const updateProduct     = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // ── Tiptap editor
  // immediatelyRender: false is required in Next.js App Router to prevent
  // the SSR/hydration mismatch Tiptap warns about when rendering server-side.
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Add a product description…" }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2 text-sm",
      },
    },
  });

  // ── Sync form state when product changes (or drawer opens)
  useEffect(() => {
    if (!product || !isOpen) return;
    setTitle(isUntitled(product) ? "" : product.title);
    setPrice(product.price);
    setStatus(product.status);
    setImages(product.images ?? []);
    setVariantGroups(product.variantGroups ?? []);
    editor?.commands.setContent(product.description ?? "");
  }, [product, isOpen, editor]);

  // Revoke blob preview URLs when drawer closes
  useEffect(() => {
    if (!isOpen) {
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
      objectUrlsRef.current = [];
    }
  }, [isOpen]);

  // ── Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images per product");
      return;
    }
    setIsUploadingImage(true);
    const uploaded: { url: string; storageId: string }[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10 MB)`);
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.push(previewUrl);

        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        const { storageId } = await res.json();
        uploaded.push({ storageId, url: previewUrl });
      }
      if (uploaded.length > 0) {
        setImages((prev) => [...prev, ...uploaded]);
        toast.success(uploaded.length === 1 ? "Image uploaded!" : `${uploaded.length} images uploaded!`);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Save — always updates (DB record already exists from createEmpty)
  const handleSave = async () => {
    if (!product) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle)  { toast.error("Title is required");             return; }
    if (price <= 0)     { toast.error("Price must be greater than 0");  return; }

    const newSlug = isUntitled(product)
      ? generateSlug(trimmedTitle) || `product-${Date.now()}`
      : product.slug;

    const description = editor?.getHTML() ?? "";

    const imagesToSave = images.map((img) => ({
      storageId: img.storageId,
      url: img.url.startsWith("blob:") ? img.storageId : img.url,
    }));

    setIsSaving(true);
    try {
      await updateProduct({
        id:            product._id,
        title:         trimmedTitle,
        slug:          newSlug,
        description:   description === "<p></p>" || description === "" ? undefined : description,
        price,
        status,
        images:        imagesToSave,
        variantGroups: variantGroups.length > 0 ? variantGroups : undefined,
      });
      toast.success("Product saved!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err.message?.includes("slug already exists")) {
        try {
          const uniqueSlug = `${newSlug}-${Math.random().toString(36).slice(2, 6)}`;
          await updateProduct({ id: product._id, slug: uniqueSlug });
          toast.success("Product saved!");
          onSuccess?.();
          onClose();
        } catch (e2: any) {
          toast.error(e2.message ?? "Save failed");
        }
      } else {
        toast.error(err.message ?? "Save failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel — slides in from right */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {product && isUntitled(product) ? "New Product" : "Edit Product"}
            </h2>
            {product?.slug && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">/{product.slug}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Images */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Images{" "}
              <span className="text-gray-400 font-normal text-xs">({images.length} / 5)</span>
            </Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0.5 left-0.5 bg-indigo-600 text-white text-[9px] px-1 py-0.5 rounded leading-none">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* Upload slot */}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  {isUploadingImage
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><Plus className="h-4 w-4" /><span className="text-[9px] mt-0.5">Add</span></>}
                </button>
              )}

              {/* Ghost placeholder slots */}
              {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
                <div
                  key={`ghost-${i}`}
                  className="aspect-square border border-dashed border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center"
                >
                  <ImageIcon className="h-4 w-4 text-gray-200" />
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="drawer-title" className="text-sm font-semibold text-gray-700">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="drawer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              className="mt-1.5"
              autoFocus={isOpen}
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="drawer-price" className="text-sm font-semibold text-gray-700">
              Price (DZD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="drawer-price"
              type="number"
              min={0}
              value={price === 0 ? "" : price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="2500"
              className="mt-1.5"
            />
          </div>

          {/* Description — Tiptap rich text */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Description</Label>
            <div className="mt-1.5 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition-shadow">
              <TiptapToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Variant Groups Editor */}
          <VariantGroupEditor
            variantGroups={variantGroups}
            onChange={setVariantGroups}
          />

          {/* Status */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Status</Label>
            <Select
              value={status}
              onValueChange={(v: "Active" | "Draft" | "Out of stock") => setStatus(v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active — visible on site</SelectItem>
                <SelectItem value="Draft">Draft — hidden from site</SelectItem>
                <SelectItem value="Out of stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3 bg-white">
          <Button
            onClick={handleSave}
            className="flex-1 gap-2"
            disabled={isSaving || isUploadingImage}
          >
            {isSaving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
              : <><Save className="h-4 w-4" />Save Changes</>}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
