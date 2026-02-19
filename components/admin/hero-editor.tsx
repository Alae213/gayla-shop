"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InlineEditText }  from "@/components/admin/inline-edit-text";
import { ImageCropDialog } from "@/components/admin/image-crop-dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SiteContent {
  heroTitle?:           string;
  heroSubtitle?:        string;
  heroCtaText?:         string;
  heroBackgroundImage?: { url: string; storageId: string } | null;
}

interface HeroEditorProps {
  siteContent:     SiteContent | null;
  /** Called whenever any inline field enters or exits edit mode */
  onDirtyChange?: (dirty: boolean) => void;
}

// ─── HeroEditor ───────────────────────────────────────────────────────────────────

export function HeroEditor({ siteContent, onDirtyChange }: HeroEditorProps) {
  // ── Image upload state
  const [cropDialogOpen,  setCropDialogOpen]  = useState(false);
  const [cropImageSrc,    setCropImageSrc]    = useState("");
  const [uploadProgress,  setUploadProgress]  = useState<number | null>(null);
  const [optimisticBgUrl, setOptimisticBgUrl] = useState<string | null>(null);

  // ── Dirty tracking: counts how many inline fields are currently in edit mode
  // onDirtyChange is called with true when any field opens, false when all close
  const editingCountRef = useRef(0);
  const handleEditingChange = useCallback(
    (isEditing: boolean) => {
      editingCountRef.current = Math.max(
        0,
        editingCountRef.current + (isEditing ? 1 : -1)
      );
      onDirtyChange?.(editingCountRef.current > 0);
    },
    [onDirtyChange]
  );

  // ── Convex
  const updateSiteContent = useMutation(api.siteContent.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Resolved values (fallback to safe defaults)
  const heroTitle    = siteContent?.heroTitle    ?? "";
  const heroSubtitle = siteContent?.heroSubtitle ?? "";
  const heroCtaText  = siteContent?.heroCtaText  ?? "Shop Now";
  const bgUrl        = optimisticBgUrl ?? siteContent?.heroBackgroundImage?.url ?? null;

  // Background style mirrors the public homepage exactly
  const bgStyle: React.CSSProperties = bgUrl
    ? { background: `url('${bgUrl}') center/cover no-repeat` }
    : { background: "var(--gradient-button)" };

  // ── Per-field save handlers ─────────────────────────────────────────────────
  // Each field saves itself independently — no “Save All” button needed.

  const saveTitle = async (value: string) => {
    await updateSiteContent({ heroTitle: value });
    toast.success("Title saved");
  };

  const saveSubtitle = async (value: string) => {
    await updateSiteContent({ heroSubtitle: value });
    toast.success("Subtitle saved");
  };

  const saveCtaText = async (value: string) => {
    await updateSiteContent({ heroCtaText: value });
    toast.success("Button text saved");
  };

  // ── Background image flow ───────────────────────────────────────────────────
  //  1. Admin double-clicks background → hidden file input opens
  //  2. File selected → blob URL created → ImageCropDialog opens
  //  3. Admin adjusts 16:9 crop → clicks “Save Image”
  //  4. Blob is XHR-uploaded to Convex storage with progress feedback
  //  5. siteContent is patched with the new storageId + url
  //  6. Optimistic URL shows the new image before Convex live-query updates

  /** Step 1: background double-click — InlineEditText stops its own propagation,
   *  so any bubbled dblclick here means the admin clicked bare background. */
  const handleBgDoubleClick = () => {
    if (uploadProgress !== null) return; // upload in progress, ignore
    fileInputRef.current?.click();
  };

  /** Step 2: file selected */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8 MB");
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setCropImageSrc(blobUrl);
    setCropDialogOpen(true);
    // Reset so re-selecting the same file triggers onChange again
    e.target.value = "";
  };

  /** Step 3–5: called by ImageCropDialog with the cropped Blob */
  const handleCropSave = async (blob: Blob) => {
    setCropDialogOpen(false);
    // Show optimistic preview from the blob immediately
    const previewUrl = URL.createObjectURL(blob);
    setOptimisticBgUrl(previewUrl);
    setUploadProgress(0);

    try {
      const uploadUrl = await generateUploadUrl();

      // XHR so we can track progress
      const storageId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", "image/jpeg");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable)
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try   { resolve(JSON.parse(xhr.responseText).storageId); }
            catch { reject(new Error("Unexpected upload response")); }
          } else {
            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(blob);
      });

      // Construct URL the same way the existing codebase does
      const convexOrigin = new URL(uploadUrl).origin;
      const imageUrl = `${convexOrigin}/api/storage/${storageId}`;

      await updateSiteContent({ heroBackgroundImage: { storageId, url: imageUrl } });
      setOptimisticBgUrl(imageUrl);
      toast.success("Hero background updated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setOptimisticBgUrl(null);
    } finally {
      setUploadProgress(null);
      URL.revokeObjectURL(previewUrl);
    }
  };

  /** Cancel: close dialog, revoke blob URL, no mutation */
  const handleCropCancel = () => {
    setCropDialogOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc("");
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────────
  if (!siteContent) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold text-gray-500">Hero Section</span>
        </div>
        <div className="w-full aspect-video bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

        {/* ── Header bar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/70">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700">Hero Section</span>
          <span className="ml-auto text-[11px] text-gray-400 italic hidden sm:block">
            Double-click&nbsp;<strong>text</strong>&nbsp;to edit&nbsp;&nbsp;·&nbsp;&nbsp;
            Double-click&nbsp;<strong>background</strong>&nbsp;to change image
          </span>
        </div>

        {/* ── 16:9 live preview — mirrors the public /  hero exactly */}
        <div
          className="relative w-full aspect-video overflow-hidden cursor-crosshair"
          style={bgStyle}
          onDoubleClick={handleBgDoubleClick}
        >
          {/* Same overlay as public hero */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Same content container as public hero */}
          <div className="page-container absolute inset-0 flex items-center z-10">
            <div className="max-w-2xl w-full">

              {/* Title — same tag + class as public h1 */}
              <InlineEditText
                as="h1"
                value={heroTitle}
                onSave={saveTitle}
                className="headline-h1 mb-5 text-white"
                placeholder="Hero title…"
                onEditingChange={handleEditingChange}
              />

              {/* Subtitle — same tag + class as public p */}
              <InlineEditText
                as="p"
                value={heroSubtitle}
                onSave={saveSubtitle}
                className="body-text mb-10 text-white/85 max-w-lg"
                placeholder="Hero subtitle…"
                onEditingChange={handleEditingChange}
              />

              {/* CTA button — same gradient + padding as public <a> */}
              <InlineEditText
                as="span"
                value={heroCtaText}
                onSave={saveCtaText}
                className="inline-block px-8 py-3.5 rounded-xl font-semibold body-text"
                style={{
                  background:  "var(--gradient-button)",
                  boxShadow:   "var(--shadow-bluebutton)",
                  color:       "white",
                }}
                placeholder="Shop Now"
                onEditingChange={handleEditingChange}
              />
            </div>
          </div>

          {/* Upload progress overlay */}
          {uploadProgress !== null && (
            <div className="absolute inset-0 bg-black/65 z-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
              <div className="w-52 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-sm font-medium">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}

          {/* Background-change affordance hint */}
          {uploadProgress === null && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5
              bg-black/50 backdrop-blur-sm text-white/60 text-[11px]
              px-2.5 py-1 rounded-full pointer-events-none">
              <span>&#10022;</span>
              double-click background to change image
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input — triggered by background double-click */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 16:9 crop dialog */}
      <ImageCropDialog
        isOpen={cropDialogOpen}
        imageSrc={cropImageSrc}
        onSave={handleCropSave}
        onCancel={handleCropCancel}
      />
    </>
  );
}
