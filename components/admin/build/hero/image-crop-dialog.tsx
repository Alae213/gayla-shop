"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CropIcon } from "lucide-react";

// Hero background always uses 16:9
const HERO_ASPECT = 16 / 9;

/** Center-initialise a 16:9 percentage crop over the full image */
function initCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 92 }, HERO_ASPECT, width, height),
    width,
    height
  );
}

/**
 * Draw the crop region onto a canvas and return it as a Blob.
 * Uses PixelCrop so coordinates are always absolute pixels.
 */
async function cropToBlob(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX  = img.naturalWidth  / img.width;
  const scaleY  = img.naturalHeight / img.height;

  canvas.width  = Math.round(crop.width  * scaleX);
  canvas.height = Math.round(crop.height * scaleY);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(
    img,
    Math.round(crop.x * scaleX),
    Math.round(crop.y * scaleY),
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Empty canvas"))),
      "image/jpeg",
      0.92
    )
  );
}

interface ImageCropDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Object URL of the raw file selected by the admin */
  imageSrc: string;
  /** Called with the cropped Blob when the admin clicks Save — parent handles upload */
  onSave: (blob: Blob) => Promise<void>;
  /** Called when admin clicks Cancel or closes the dialog */
  onCancel: () => void;
}

export function ImageCropDialog({
  isOpen,
  imageSrc,
  onSave,
  onCancel,
}: ImageCropDialogProps) {
  const [crop,          setCrop]          = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSaving,      setIsSaving]      = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Auto-initialise a centred 16:9 crop as soon as the image loads
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
      setCrop(initCrop(w, h));
    },
    []
  );

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsSaving(true);
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop);
      await onSave(blob);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-4 w-4 text-indigo-500" />
            Crop Hero Background
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Drag the handles to adjust. Aspect ratio is fixed at&nbsp;
            <strong>16 : 9</strong>.
          </p>
        </DialogHeader>

        {/* Crop workspace */}
        <div className="flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden">
          {imageSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={HERO_ASPECT}
              minWidth={80}
              keepSelection
            >
              {/* Using <img> intentionally — react-image-crop requires a real DOM img */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "56vh", width: "auto", display: "block" }}
              />
            </ReactCrop>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              Loading image…
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !completedCrop}
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
            ) : (
              "Save Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
