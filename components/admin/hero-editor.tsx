"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface HeroEditorProps {
  siteContent: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroCtaText?: string;
    heroBackgroundImage?: {
      url: string;
      storageId: string;
    };
  } | null;
  onSave: () => void;
  /** M1 Task 1.2 — called whenever local state diverges from (or matches) siteContent */
  onDirtyChange?: (dirty: boolean) => void;
}

export function HeroEditor({ siteContent, onSave, onDirtyChange }: HeroEditorProps) {
  const [editingHero, setEditingHero]     = useState(false);
  const [heroTitle,   setHeroTitle]       = useState("");
  const [heroSubtitle,setHeroSubtitle]    = useState("");
  const [heroCtaText, setHeroCtaText]     = useState("Shop Now");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveStatus,  setSaveStatus]      = useState<"idle" | "saving" | "saved">("idle");

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const debounceTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSiteContent = useMutation(api.siteContent.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  // Sync local state when siteContent loads from Convex
  useEffect(() => {
    if (siteContent) {
      setHeroTitle(siteContent.heroTitle || "");
      setHeroSubtitle(siteContent.heroSubtitle || "");
      setHeroCtaText(siteContent.heroCtaText || "Shop Now");
    }
  }, [siteContent]);

  // M1 Task 1.2 — derive dirty state and report it to the parent
  useEffect(() => {
    if (!onDirtyChange || !siteContent) return;
    const dirty =
      heroTitle    !== (siteContent.heroTitle    ?? "") ||
      heroSubtitle !== (siteContent.heroSubtitle ?? "") ||
      heroCtaText  !== (siteContent.heroCtaText  ?? "Shop Now");
    onDirtyChange(dirty);
  }, [heroTitle, heroSubtitle, heroCtaText, siteContent, onDirtyChange]);

  // Debounced save — fires 500ms after the user stops typing
  const debouncedSave = useCallback(
    (title: string, subtitle: string, ctaText: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveStatus("saving");
      debounceTimer.current = setTimeout(async () => {
        try {
          await updateSiteContent({ heroTitle: title, heroSubtitle: subtitle, heroCtaText: ctaText });
          setSaveStatus("saved");
          onSave();
          setTimeout(() => setSaveStatus("idle"), 5000); // M1 P3: extend to 5s
        } catch (error: any) {
          setSaveStatus("idle");
          toast.error(error.message || "Failed to save changes");
        }
      }, 500);
    },
    [updateSiteContent, onSave]
  );

  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      const convexUrl = new URL(uploadUrl);
      const imageUrl = `${convexUrl.origin}/api/storage/${storageId}`;
      await updateSiteContent({
        heroBackgroundImage: { storageId, url: imageUrl },
      });
      toast.success("Hero background updated!");
      onSave();
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          Hero Section
        </h2>
        <div className="flex items-center gap-3">
          {/* Save status indicator — visible in both edit and preview states */}
          {saveStatus !== "idle" && (
            <span className="text-xs flex items-center gap-1 text-gray-500">
              {saveStatus === "saving" ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-indigo-600" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
            </span>
          )}
          <Button
            variant={editingHero ? "default" : "outline"}
            onClick={() => setEditingHero(!editingHero)}
            size="sm"
          >
            {/* M1 P3: renamed from 'Close' to 'Done' */}
            {editingHero ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {editingHero ? (
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

          <div>
            <Label>Hero Background Image</Label>
            {siteContent.heroBackgroundImage && (
              <p className="text-xs text-green-600 mt-1 mb-2">
                ✓ Background image is set
              </p>
            )}
            <div className="mt-2">
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
                disabled={isUploadingImage}
                className="w-full"
              >
                {isUploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {siteContent.heroBackgroundImage ? "Change Background Image" : "Upload Background Image"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Title</p>
            <p className="text-lg font-semibold text-gray-900">{heroTitle || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Subtitle</p>
            <p className="text-gray-700">{heroSubtitle || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">CTA Button</p>
            <Badge variant="secondary">{heroCtaText}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Background Image</p>
            <p className="text-sm">
              {siteContent.heroBackgroundImage ? (
                <span className="text-green-600 font-medium">✓ Image set</span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
