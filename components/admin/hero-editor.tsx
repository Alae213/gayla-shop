"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Check, X, ImageOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroBackgroundImage?: { url: string; storageId: string } | null;
}

interface HeroEditorProps {
  siteContent: SiteContent | null;
  onSave: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

// ─── HeroPreviewCard ─────────────────────────────────────────────────────────
// Task 2.1: live preview card rendered below the form fields

function HeroPreviewCard({
  title,
  subtitle,
  ctaText,
  bgUrl,
}: {
  title: string;
  subtitle: string;
  ctaText: string;
  bgUrl: string | null;
}) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg">
      {/* Background image or placeholder */}
      {bgUrl ? (
        <Image src={bgUrl} alt="Hero background" fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <ImageOff className="h-10 w-10 text-gray-600" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-xl leading-tight drop-shadow">
          {title || <span className="opacity-40">Hero title…</span>}
        </h3>
        {subtitle && (
          <p className="text-gray-300 text-sm mt-1 drop-shadow">{subtitle}</p>
        )}
        {ctaText && (
          <span className="inline-block mt-3 bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-full shadow">
            {ctaText}
          </span>
        )}
      </div>

      {/* Preview badge */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
        Preview
      </div>
    </div>
  );
}

// ─── HeroEditor ───────────────────────────────────────────────────────────────

export function HeroEditor({ siteContent, onSave, onDirtyChange }: HeroEditorProps) {
  const [editingHero,      setEditingHero]      = useState(false);
  const [heroTitle,        setHeroTitle]        = useState("");
  const [heroSubtitle,     setHeroSubtitle]     = useState("");
  const [heroCtaText,      setHeroCtaText]      = useState("Shop Now");
  const [uploadProgress,   setUploadProgress]   = useState<number | null>(null); // null = idle
  const [optimisticBgUrl,  setOptimisticBgUrl]  = useState<string | null>(null); // Task 2.4
  const [saveStatus,       setSaveStatus]       = useState<"idle" | "saving" | "saved">("idle");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSiteContent = useMutation(api.siteContent.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  // Sync local state from Convex
  useEffect(() => {
    if (siteContent) {
      setHeroTitle(siteContent.heroTitle || "");
      setHeroSubtitle(siteContent.heroSubtitle || "");
      setHeroCtaText(siteContent.heroCtaText || "Shop Now");
    }
  }, [siteContent]);

  // M1 Task 1.2 — dirty tracking
  useEffect(() => {
    if (!onDirtyChange || !siteContent) return;
    const dirty =
      heroTitle    !== (siteContent.heroTitle    ?? "") ||
      heroSubtitle !== (siteContent.heroSubtitle ?? "") ||
      heroCtaText  !== (siteContent.heroCtaText  ?? "Shop Now");
    onDirtyChange(dirty);
  }, [heroTitle, heroSubtitle, heroCtaText, siteContent, onDirtyChange]);

  // Debounced save
  const debouncedSave = useCallback(
    (title: string, subtitle: string, ctaText: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveStatus("saving");
      debounceTimer.current = setTimeout(async () => {
        try {
          await updateSiteContent({ heroTitle: title, heroSubtitle: subtitle, heroCtaText: ctaText });
          setSaveStatus("saved");
          onSave();
          setTimeout(() => setSaveStatus("idle"), 5000);
        } catch (error: any) {
          setSaveStatus("idle");
          toast.error(error.message || "Failed to save changes");
        }
      }, 500);
    },
    [updateSiteContent, onSave]
  );

  // Task 2.4 — XHR upload for progress tracking
  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Optimistic local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setOptimisticBgUrl(objectUrl);
    setUploadProgress(0);

    try {
      const uploadUrl = await generateUploadUrl();

      // XHR so we can track progress
      const storageId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.storageId);
            } catch {
              reject(new Error("Invalid upload response"));
            }
          } else {
            reject(new Error("Upload failed: " + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      const convexUrl  = new URL(uploadUrl);
      const imageUrl   = `${convexUrl.origin}/api/storage/${storageId}`;

      await updateSiteContent({
        heroBackgroundImage: { storageId, url: imageUrl },
      });

      // Replace optimistic blob URL with persisted URL
      setOptimisticBgUrl(imageUrl);
      toast.success("Hero background updated!");
      onSave();
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
      setOptimisticBgUrl(null);
    } finally {
      setUploadProgress(null);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Task 2.1 — remove hero background
  const handleRemoveImage = async () => {
    try {
      await updateSiteContent({ heroBackgroundImage: null });
      setOptimisticBgUrl(null);
      toast.success("Background image removed");
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
    } finally {
      setShowRemoveDialog(false);
    }
  };

  if (!siteContent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Loading hero section...</p>
        </div>
      </div>
    );
  }

  // Resolved bg: optimistic blob → persisted DB URL → null
  const resolvedBgUrl = optimisticBgUrl ?? siteContent.heroBackgroundImage?.url ?? null;
  const hasImage = !!resolvedBgUrl;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          Hero Section
        </h2>
        <div className="flex items-center gap-3">
          {saveStatus !== "idle" && (
            <span className="text-xs flex items-center gap-1 text-gray-500">
              {saveStatus === "saving" ? (
                <><div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-indigo-600" /> Saving...</>
              ) : (
                <><Check className="h-3 w-3 text-green-500" /><span className="text-green-600">Saved</span></>
              )}
            </span>
          )}
          <Button
            variant={editingHero ? "default" : "outline"}
            onClick={() => setEditingHero(!editingHero)}
            size="sm"
          >
            {editingHero ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {/* ── Edit mode ─────────────────────────────────────────────────────── */}
      {editingHero ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Left — form fields */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={heroTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeroTitle(val);
                  debouncedSave(val, heroSubtitle, heroCtaText);
                }}
                placeholder="Welcome to Gayla"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={heroSubtitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeroSubtitle(val);
                  debouncedSave(heroTitle, val, heroCtaText);
                }}
                placeholder="Discover premium streetwear"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="heroCtaText">Call-to-Action Button Text</Label>
              <Input
                id="heroCtaText"
                value={heroCtaText}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeroCtaText(val);
                  debouncedSave(heroTitle, heroSubtitle, val);
                }}
                placeholder="Shop Now"
                className="mt-2"
              />
            </div>

            {/* Background image controls */}
            <div>
              <Label>Hero Background Image</Label>
              <div className="mt-3 space-y-3">
                {/* Thumbnail + remove button when image is set */}
                {hasImage && (
                  <div className="relative inline-block">
                    <div className="relative h-[120px] w-[200px] rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={resolvedBgUrl!}
                        alt="Current hero background"
                        fill
                        className="object-cover"
                      />
                      {uploadProgress !== null && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                    {/* × remove button */}
                    {uploadProgress === null && (
                      <button
                        type="button"
                        onClick={() => setShowRemoveDialog(true)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroBackgroundUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                    className="w-full"
                  >
                    {uploadProgress !== null ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600 mr-2" /> Uploading {uploadProgress}%</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />{hasImage ? "Change Background Image" : "Upload Background Image"}</>
                    )}
                  </Button>
                  {/* Progress bar */}
                  {uploadProgress !== null && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Preview</p>
            <HeroPreviewCard
              title={heroTitle}
              subtitle={heroSubtitle}
              ctaText={heroCtaText}
              bgUrl={resolvedBgUrl}
            />
          </div>
        </div>

      ) : (
        /* ── Preview-only mode ───────────────────────────────────────────── */
        <div className="space-y-4">
          <HeroPreviewCard
            title={heroTitle}
            subtitle={heroSubtitle}
            ctaText={heroCtaText}
            bgUrl={resolvedBgUrl}
          />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Title</p>
              <p className="text-sm font-medium text-gray-800 truncate">{heroTitle || <span className="text-gray-300">Not set</span>}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Subtitle</p>
              <p className="text-sm text-gray-700 truncate">{heroSubtitle || <span className="text-gray-300">Not set</span>}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">CTA</p>
              <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">{heroCtaText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Remove image confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove background image?</AlertDialogTitle>
            <AlertDialogDescription>
              The hero section will show a plain background until you upload a new image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveImage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
