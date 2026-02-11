"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles } from "lucide-react";
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
  } | null; // ✅ ADD NULL
  onSave: () => void;
}

export function HeroEditor({ siteContent, onSave }: HeroEditorProps) {
  const [editingHero, setEditingHero] = useState(false);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("Shop Now");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSiteContent = useMutation(api.siteContent.update);
  const generateUploadUrl = useMutation(api.siteContent.generateUploadUrl);

  // ✅ UPDATE EFFECT TO HANDLE NULL
  useEffect(() => {
    if (siteContent) {
      setHeroTitle(siteContent.heroTitle || "");
      setHeroSubtitle(siteContent.heroSubtitle || "");
      setHeroCtaText(siteContent.heroCtaText || "Shop Now");
    }
  }, [siteContent]);

  const saveHeroChanges = async () => {
    try {
      await updateSiteContent({
        heroTitle,
        heroSubtitle,
        heroCtaText,
      });
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    }
  };

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
      const imageUrl = new URL(uploadUrl);
      imageUrl.pathname = `/api/storage/${storageId}`;

      await updateSiteContent({
        heroBackgroundImage: {
          storageId,
          url: imageUrl.toString(),
        },
      });

      toast.success("Hero background updated!");
      onSave();
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ✅ HANDLE NULL CASE
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
        <Button
          variant={editingHero ? "default" : "outline"}
          onClick={() => setEditingHero(!editingHero)}
          size="sm"
        >
          {editingHero ? "Close" : "Edit"}
        </Button>
      </div>

      {editingHero ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => {
                setHeroTitle(e.target.value);
                saveHeroChanges();
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
                setHeroSubtitle(e.target.value);
                saveHeroChanges();
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
                setHeroCtaText(e.target.value);
                saveHeroChanges();
              }}
              placeholder="Shop Now"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Hero Background Image</Label>
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
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600 mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Background Image
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
        </div>
      )}
    </div>
  );
}
